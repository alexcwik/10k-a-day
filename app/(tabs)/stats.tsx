// app/(tabs)/stats.tsx
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useAuth } from '../../contexts/AuthContext';

const StatsPage = () => {
    const { user, firebaseApp } = useAuth();
    const db = useMemo(() => (firebaseApp ? getFirestore(firebaseApp) : null), [firebaseApp]);
    const [dailySteps, setDailySteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAndProcessWalks = async () => {
            if (!user || !db) {
                setError("Please sign in to view stats.");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const appId = 'default-app-id';
                const walksCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/walk_history`);
                const q = query(walksCollectionRef, orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);

                const walks = querySnapshot.docs.map(doc => ({ ...doc.data(), date: doc.data().date.toDate() }));

                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() - i);
                    return d;
                }).reverse();

                const processedData = last7Days.map(day => {
                    const walksOnDay = walks.filter(w => w.date.toDateString() === day.toDateString());
                    const totalSteps = walksOnDay.reduce((sum, w) => sum + (w.steps || 0), 0);
                    return {
                        value: totalSteps,
                        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
                        frontColor: '#2DD4BF'
                    };
                });
                setDailySteps(processedData);

            } catch (err) {
                setError("Failed to load statistics.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessWalks();
    }, [user, db]);

    if (loading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2DD4BF" /></View>;
    }

    if (error) {
        return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Weekly Steps</Text>
            <View style={styles.chartContainer}>
                 {dailySteps.length > 0 ? (
                    <BarChart
                        data={dailySteps}
                        barWidth={30}
                        spacing={20}
                        roundedTop
                        roundedBottom
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: 'gray' }}
                        noOfSections={5}
                        maxValue={Math.max(10000, ...dailySteps.map(d => d.value))}
                    />
                 ) : (
                    <Text style={styles.infoText}>No data for the last 7 days.</Text>
                 )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712', padding: 16 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 24 },
    chartContainer: {
        marginVertical: 20,
        padding: 16,
        backgroundColor: '#111827',
        borderRadius: 16,
    },
    errorText: { color: '#EF4444', fontSize: 16 },
    infoText: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', paddingVertical: 40 },
});

export default StatsPage;