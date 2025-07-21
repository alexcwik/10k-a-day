// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false, // Set to false to use a custom header if needed
        tabBarActiveTintColor: '#2DD4BF', // teal-400
        tabBarInactiveTintColor: '#9CA3AF', // gray-400
        tabBarStyle: {
          backgroundColor: '#111827', // gray-900
          borderTopColor: '#374151', // gray-700
        },
      })}
    >
      <Tabs.Screen
        name="index" // Corresponds to index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats" // Will correspond to stats.tsx
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history" // Will correspond to history.tsx
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}