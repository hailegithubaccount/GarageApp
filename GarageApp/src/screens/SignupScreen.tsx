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
import { registerLogin$ } from '../api/auth/register';
import useRequest from '../Hooks/useRequest';
import { Colors, Typography, Spacing } from '../theme';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }: StackScreenProps<any>) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const registerRequest = useRequest();

    useEffect(() => {
        let mounted = true;
        if (mounted && registerRequest.isSuccess) {
            console.log('the register response is ', registerRequest?.response?.data);
            const resData = registerRequest?.response?.data;

            if (resData?.success) {
                const { accesstoken, user } = resData;

                const handleSuccess = async () => {
                    await AsyncStorage.setItem('userToken', accesstoken);
                    await AsyncStorage.setItem('userData', JSON.stringify(user));

                    setShowSuccessModal(true);

                    // Wait for 5 seconds as requested
                    setTimeout(() => {
                        if (mounted) {
                            setShowSuccessModal(false);
                            navigation.replace('Location');
                        }
                    }, 5000);
                };

                handleSuccess();
            } else if (resData?.message) {
                Alert.alert('Registration Failed', resData.message);
            }
        }
        return () => {
            mounted = false;
        };
    }, [registerRequest.isSuccess, navigation, registerRequest.response]);

    const handleSignup = async () => {
        if (!fullName || !email || !phoneNumber || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await registerRequest.doRequest(
                registerLogin$(fullName, email, phoneNumber, password)
            );
        } catch (error: any) {
            console.error('Signup error:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Signup Error', errorMessage);
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
                        <Text style={styles.title}>Join Us</Text>
                        <Text style={styles.subtitle}>
                            Create your account to start managing your vehicle services.
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={Colors.grey}
                            value={fullName}
                            onChangeText={setFullName}
                            editable={!registerRequest.loading && !showSuccessModal}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.grey}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!registerRequest.loading && !showSuccessModal}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={Colors.grey}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            editable={!registerRequest.loading && !showSuccessModal}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.grey}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!registerRequest.loading && !showSuccessModal}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signUpButton, (registerRequest.loading || showSuccessModal) && styles.disabledButton]}
                        onPress={handleSignup}
                        disabled={registerRequest.loading || showSuccessModal}
                    >
                        {registerRequest.loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.signUpText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            disabled={showSuccessModal}
                        >
                            <Text style={styles.loginText}>Sign In</Text>
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
        marginBottom: Spacing.huge,
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
    signUpButton: {
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
    signUpText: {
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
    loginText: {
        ...Typography.link,
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

export default SignupScreen;
