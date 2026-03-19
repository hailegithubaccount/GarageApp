import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginLogin$ } from '../api/auth/login';
import useRequest from '../Hooks/useRequest';
import { Colors, Typography, Spacing } from '../theme';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: StackScreenProps<any>) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const loginRequest = useRequest();

    useEffect(() => {
        let mounted = true;
        if (mounted && loginRequest.isSuccess) {
            console.log('the login response is ', loginRequest?.response?.data);
            const resData = loginRequest?.response?.data;

            if (resData?.success) {
                const { accesstoken, user } = resData;

                const handleSuccess = async () => {
                    await AsyncStorage.setItem('userToken', accesstoken);
                    await AsyncStorage.setItem('userData', JSON.stringify(user));

                    setShowSuccessModal(true);

                    // Check if user has location setup
                    const hasLocation = user.location && user.location.address;

                    // Wait for 5 seconds as requested
                    setTimeout(() => {
                        if (mounted) {
                            setShowSuccessModal(false);
                            navigation.replace(hasLocation ? 'Location' : 'Location');
                        }
                    }, 5000);
                };

                handleSuccess();
            } else if (resData?.message) {
                Alert.alert('Login Failed', resData.message);
            }
        }
        return () => {
            mounted = false;
        };
    }, [loginRequest.isSuccess, navigation, loginRequest.response]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            await loginRequest.doRequest(
                loginLogin$(email, password)
            );
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Login Error', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ImageBackground
                source={require('../assets/images/login_bg.png')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Let's Get Started</Text>
                        <Text style={styles.subtitle}>
                            Welcome to your Mechano! We're thrilled to have you here.
                        </Text>
                    </View>

                    <View style={styles.headerSpacer} />

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.grey}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loginRequest.loading && !showSuccessModal}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.grey}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loginRequest.loading && !showSuccessModal}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signInButton, (loginRequest.loading || showSuccessModal) && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={loginRequest.loading || showSuccessModal}
                    >
                        {loginRequest.loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.signInText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            disabled={showSuccessModal}
                        >
                            <Text style={styles.createNowText}>Create now!</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.separatorContainer}>
                        <View style={styles.line} />
                        <Text style={styles.separatorText}></Text>
                        <View style={styles.line} />
                    </View>
                </ScrollView>

                {/* Success Modal */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.successTitle}>Success</Text>
                            <ActivityIndicator color={Colors.success} style={{ marginVertical: 15 }} />
                            <Text style={styles.successSubtitle}>
                                Please wait until redirected to home page
                            </Text>
                        </View>
                    </View>
                </Modal>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlay,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.giant,
        paddingBottom: Spacing.huge,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    headerSpacer: {
        height: 100,
    },
    title: {
        ...Typography.h1,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.subtitle,
        textAlign: 'center',
        paddingHorizontal: Spacing.sm,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xxl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.glassBorderLight,
    },
    separatorText: {
        ...Typography.small,
        paddingHorizontal: Spacing.md,
    },
    inputContainer: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    input: {
        backgroundColor: Colors.glass,
        height: Spacing.inputHeight,
        borderRadius: Spacing.borderRadius,
        paddingHorizontal: Spacing.l,
        color: Colors.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    signInButton: {
        backgroundColor: Colors.primary,
        height: Spacing.buttonHeight,
        borderRadius: Spacing.borderRadius,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    signInText: {
        ...Typography.button,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xxl,
    },
    footerText: {
        ...Typography.small,
    },
    createNowText: {
        ...Typography.link,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: width * 0.8,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    successTitle: {
        ...Typography.h2,
        color: Colors.success,
        marginBottom: 10,
    },
    successSubtitle: {
        ...Typography.subtitle,
        textAlign: 'center',
        color: '#FFF',
    },
});

export default LoginScreen;
