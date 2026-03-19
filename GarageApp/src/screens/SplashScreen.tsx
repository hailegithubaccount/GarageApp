import React, { useEffect } from 'react';
import { StyleSheet, View, ImageBackground, Image, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { StackScreenProps } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: StackScreenProps<any>) => {
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const bgZoom = useSharedValue(1);

    useEffect(() => {
        // Logo Fade-in and Scale-up
        logoOpacity.value = withTiming(1, { duration: 1500 });
        logoScale.value = withTiming(1, {
            duration: 2000,
            easing: Easing.out(Easing.exp)
        });

        // Background subtle zoom
        bgZoom.value = withTiming(1.1, { duration: 4000 });

        // Navigate to Login after 3 seconds
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: logoOpacity.value,
            transform: [{ scale: logoScale.value }],
        };
    });

    const bgAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [{ scale: bgZoom.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFill, bgAnimatedStyle]}>
                <ImageBackground
                    source={require('../assets/images/splash_bg.png')}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            </Animated.View>

            <View style={styles.overlay} />

            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                    source={require('../assets/images/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
    },
});

export default SplashScreen;
