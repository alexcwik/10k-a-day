// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from './../contexts/AuthContext';
import { GoogleMapsProvider } from './../contexts/GoogleMapsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <GoogleMapsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GoogleMapsProvider>
    </AuthProvider>
  );
}