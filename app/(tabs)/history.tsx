// app/(tabs)/history.tsx
import polyline from '@mapbox/polyline';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline as MapPolyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';

const HistoryPage = () => {
    const { user, firebaseApp } = useAuth();
    const db = useMemo(() => (firebaseApp ? getFirestore(firebaseApp) : null), [firebaseApp]);
    const [walks, setWalks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedWalk, setSelectedWalk] = useState<any>(null);
    const [decodedPath, setDecodedPath] = useState<{latitude: number, longitude: number}[]>([]);

    useEffect(() => {
        if (selectedWalk?.encodedPolyline) {
            const points = polyline.decode(selectedWalk.encodedPolyline).map(point => ({
                latitude: point[0],
                longitude: point[1],
            }));
            setDecodedPath(points);
        }
    }, [selectedWalk]);

    useEffect(() => {
        if (!user || !db) { /* ... */ return; }
        const fetchWalks = async () => {
            setLoading(true);
            try {
                const appId = 'default-app-id';
                const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/walk_history`), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                const walksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWalks(walksData);
                if (walksData.length > 0) {
                    setSelectedWalk(walksData[0]);
                }
            } catch (err) {
                setError("Failed to fetch walk history.");
            } finally {
                setLoading(false);
            }
        };
        fetchWalks();
    }, [user, db]);

    const formatDate = (timestamp: any) => { /* ... */ return timestamp?.toDate()?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A' };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Walk History</Text>
            <View style={styles.mapContainer}>
                {loading && <ActivityIndicator style={StyleSheet.absoluteFill} />}
                {selectedWalk && decodedPath.length > 0 ? (
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: decodedPath[0].latitude,
                            longitude: decodedPath[0].longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05
                        }}
                    >
                        <MapPolyline coordinates={decodedPath} strokeColor="#2DD4BF" strokeWidth={5} />
                    </MapView>
                ) : <Text style={styles.infoText}>Select a walk to view the route</Text>}
            </View>
            <FlatList
                data={walks}
                renderItem={({ item }) => (
                     <TouchableOpacity
                        onPress={() => setSelectedWalk(item)}
                        style={[styles.walkItem, selectedWalk?.id === item.id && styles.selectedWalkItem]}
                    >
                        <Text style={styles.walkDate}>Date: {formatDate(item.date)}</Text>
                        <Text style={styles.walkSteps}>Steps: {item.steps}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({ /* ... styles from previous response ... */ });
export default HistoryPage;