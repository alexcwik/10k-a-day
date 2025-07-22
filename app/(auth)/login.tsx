// app/(auth)/login.tsx
import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AuthForm from '../../components/AuthForm';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const { signIn } = useAuth();

  const handleLogin = (data: any) => {
    // The signIn function from AuthContext will handle navigation
    signIn(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <AuthForm onSubmit={handleLogin} buttonText="Sign In" />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup">
            <Text style={styles.link}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c6c70',
    textAlign: 'center',
    marginBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6c6c70',
  },
  link: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;