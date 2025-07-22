// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// This component defines the layout for the tab bar and headers.
export default function TabLayout() {
  // --- DEBUGGING STEP ---
  // The useAuth hook provides the signOut function. If this line causes an error,
  // it likely means the AuthContext is not set up correctly in the root layout file (app/_layout.tsx)
  // or the path to the context is wrong for your project structure.
  // Make sure the path is correct: import { useAuth } from '../../contexts/AuthContext';
  const auth = useAuth();

  // It's safer to check if the function exists before using it.
  const handleSignOut = () => {
    if (auth && typeof auth.signOut === 'function') {
      auth.signOut();
      // After signing out, the root layout should handle redirecting to the login screen automatically.
    } else {
      console.error("Sign out function is not available on the auth context. Check your AuthProvider.");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1c1c1e', // Dark background for the tab bar
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        headerStyle: {
            backgroundColor: '#1c1c1e', // Dark background for the header
        },
        headerTintColor: '#ffffff', // White text for the header title
        headerTitleStyle: {
            fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '10K-A-Day',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          // Ensure auth object is loaded before trying to render the sign out button
          headerRight: () => (
            auth ? (
              <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
                <Text style={{ color: '#FF453A', fontSize: 16, fontWeight: 'bold' }}>Sign Out</Text>
              </TouchableOpacity>
            ) : null // Render nothing if auth context is not yet available
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}