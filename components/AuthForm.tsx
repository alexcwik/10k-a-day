// components/AuthForm.tsx
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed

interface AuthFormProps {
    mode: 'signin' | 'signup';
    onSuccess: (user: any) => void;
    onCancel: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess, onCancel }) => {
    const { authInstance, setErrorMessage, createUserWithEmailAndPassword, signInWithEmailAndPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!authInstance) {
            setError("Authentication service is not ready.");
            return;
        }
        setError('');
        setErrorMessage('');
        setIsLoading(true);

        if (mode === 'signup' && password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            let userCredential;
            if (mode === 'signup') {
                userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(authInstance, email, password);
            }
            onSuccess(userCredential.user);
        } catch (err: any) {
            let friendlyError = `Sign-${mode === 'signup' ? 'up' : 'in'} failed. Please try again.`;
            switch (err.code) {
                case 'auth/invalid-email': friendlyError = 'The email address is not valid.'; break;
                case 'auth/user-not-found': friendlyError = 'No user found with this email.'; break;
                case 'auth/wrong-password': friendlyError = 'Incorrect password.'; break;
                case 'auth/email-already-in-use': friendlyError = 'This email is already registered.'; break;
                case 'auth/weak-password': friendlyError = 'Password is too weak (min 6 characters).'; break;
            }
            setError(friendlyError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            transparent={true}
            visible={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>
                        {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    </Text>

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="your.email@example.com"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                    />

                    {mode === 'signup' && (
                        <>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="••••••••"
                                placeholderTextColor="#9CA3AF"
                            />
                        </>
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={[styles.button, isLoading && styles.buttonDisabled]}>
                        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1F2937', // gray-800
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#374151', // gray-700
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2DD4BF', // teal-400
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#D1D5DB', // gray-300
        marginBottom: 8,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#374151', // gray-700
        borderWidth: 1,
        borderColor: '#4B5563', // gray-600
        borderRadius: 8,
        color: '#F9FAFB', // gray-100
        marginBottom: 16,
    },
    errorText: {
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444', // red-700
        color: '#F87171', // red-400
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 16,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#14B8A6', // teal-600
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#4B5563', // gray-600
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        width: '100%',
        backgroundColor: '#374151', // gray-700
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#D1D5DB', // gray-300
    },
});

export default AuthForm;