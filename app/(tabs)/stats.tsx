// app/(tabs)/stats.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const StatsScreen = () => {
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalActivities: 0,
    totalSteps: 0,
    longestRun: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const calculateStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const storedActivities = await AsyncStorage.getItem('activities');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0);
        const totalSteps = activities.reduce((sum, act) => sum + act.steps, 0);
        const longestRun = activities.reduce((max, act) => Math.max(max, act.distance), 0);
        
        setStats({
          totalDistance,
          totalActivities: activities.length,
          totalSteps,
          longestRun,
        });
      }
    } catch (e) {
      console.error("Failed to calculate stats.", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      calculateStats();
    }, [calculateStats])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={calculateStats} tintColor="#fff" />}
      >
        <Text style={styles.title}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(stats.totalDistance / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Kilometers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalActivities}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalSteps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Steps</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(stats.longestRun / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Longest Run (km)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1e' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { backgroundColor: '#2c2c2e', width: '48%', padding: 20, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 14, color: '#aeaebe' },
});

export default StatsScreen;