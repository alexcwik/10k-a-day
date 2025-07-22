// app/(tabs)/history.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const HistoryScreen = () => {
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = useCallback(async () => {
    setRefreshing(true);
    try {
      const storedActivities = await AsyncStorage.getItem('activities');
      if (storedActivities) {
        // Sort by most recent first
        const parsedActivities = JSON.parse(storedActivities);
        setActivities(parsedActivities.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (e) {
      console.error("Failed to load activities.", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // useFocusEffect will run the callback every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
        <Text style={styles.itemText}>Steps: {item.steps.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Activity History</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No activities recorded yet.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadActivities} tintColor="#fff" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1e' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', padding: 20, paddingBottom: 10 },
  list: { paddingBottom: 20 },
  itemContainer: { backgroundColor: '#2c2c2e', padding: 20, borderRadius: 10, marginHorizontal: 20, marginBottom: 15 },
  itemDate: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  itemDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { fontSize: 16, color: '#e5e5ea' },
  emptyText: { color: 'gray', textAlign: 'center', marginTop: 50 },
});

export default HistoryScreen;