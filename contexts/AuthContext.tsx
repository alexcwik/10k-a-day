// contexts/AuthContext.tsx
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the shape of your context data
interface AuthContextType {
    user: User | null;
    authReady: boolean;
    firebaseApp: FirebaseApp | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Define props for the provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);

    useEffect(() => {
        // Your Firebase config
        const firebaseConfig = {
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, // Use Expo environment variables
            authDomain: "daily-steps-tracker.firebaseapp.com",
            projectId: "daily-steps-tracker",
            storageBucket: "daily-steps-tracker.appspot.com",
            messagingSenderId: "838553350749",
            appId: "1:838553350749:web:ce4f60e1beef348d20d3b4"
        };

        try {
            const app = initializeApp(firebaseConfig);
            setFirebaseApp(app);
            const auth = getAuth(app);

            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setAuthReady(true);
            });

            return () => unsubscribe();
        } catch (e) {
            console.warn("Firebase initialization failed:", e);
        }
    }, []);

    const value = {
        user,
        authReady,
        firebaseApp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};