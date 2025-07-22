// contexts/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the shape of the authentication context
interface AuthContextType {
  user: any; // Replace 'any' with your user type
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that will wrap the application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // On component mount, check for a stored user session
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Sign in function
  const signIn = async (data: any) => {
    // --- TODO: Replace with your actual API call for signing in ---
    console.log("Signing in with", data);
    const fakeUser = { id: '1', email: data.email }; 
    setUser(fakeUser);
    await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
  };

  // Sign up function
  const signUp = async (data: any) => {
    // --- TODO: Replace with your actual API call for signing up ---
    console.log("Signing up with", data);
    const fakeUser = { id: '1', email: data.email };
    setUser(fakeUser);
    await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
  };

  // Sign out function
  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
