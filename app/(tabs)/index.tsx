// app/(tabs)/index.tsx
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
    // Constants
    const AVG_STEP_LENGTH_METERS = 0.76;
    const TARGET_TOTAL_STEPS = 10000;

    // Contexts
    const { user, firebaseApp } = useAuth();
    const db = useMemo(() => (firebaseApp ? getFirestore(firebaseApp) : null), [firebaseApp]);

    // State
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [alreadyWalkedSteps, setAlreadyWalkedSteps] = useState(0);
    const [generatedRoute, setGeneratedRoute] = useState<{ polyline: any[]; steps: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [sessionSteps, setSessionSteps] = useState(0);

    const mapRef = useRef<MapView>(null);

    const targetStepsForRoute = useMemo(() => {
        const totalCurrent = (alreadyWalkedSteps || 0) + (sessionSteps || 0);
        return Math.max(0, TARGET_TOTAL_STEPS - totalCurrent);
    }, [alreadyWalkedSteps, sessionSteps]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMessage('Permission to access location was denied');
                return;
            }

            setIsLoading(true);
            try {
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const userLatLng = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setCurrentLocation(userLatLng);
                mapRef.current?.animateToRegion({ ...userLatLng, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
            } catch (error) {
                setErrorMessage('Could not retrieve location.');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleGenerateRoute = () => {
        setErrorMessage("Automatic route generation is a complex feature to translate. This would require a dedicated Directions API service setup.");
    };

    const handleSaveRoute = async () => {
        if (!user || !db || sessionSteps === 0) {
            setErrorMessage("No steps were recorded in this session to save.");
            return;
        }

        setIsLoading(true);
        try {
            const appId = 'default-app-id';
            const historyCollection = collection(db, `artifacts/${appId}/users/${user.uid}/walk_history`);
            const walkDataToSave = {
                steps: sessionSteps,
                distanceMeters: sessionSteps * AVG_STEP_LENGTH_METERS,
                date: serverTimestamp(),
                startLocation: currentLocation,
                // In a real app with route generation, you would save the polyline here
            };
            await addDoc(historyCollection, walkDataToSave);
            setErrorMessage("Your walk has been saved!");
            setAlreadyWalkedSteps(prev => prev + sessionSteps);
            setSessionSteps(0);
        } catch (error) {
            setErrorMessage("Failed to save your walk.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <View style={[styles.map, styles.mapPlaceholder]}>
                    <Text style={styles.mapPlaceholderText}>Map is available on mobile only.</Text>
                </View>
            ) : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation
                    customMapStyle={darkMapStyle}
                >
                    {generatedRoute && <Polyline coordinates={generatedRoute.polyline} strokeColor="#2DD4BF" strokeWidth={6} />}
                </MapView>
            )}

            {isLoading && !currentLocation && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Getting your location...</Text>
                </View>
            )}

            <View style={styles.controlsContainer}>
                <Text style={styles.goalTitle}>Steps Goal</Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(((alreadyWalkedSteps + sessionSteps) / TARGET_TOTAL_STEPS) * 100, 100)}%` }]} />
                </View>

                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.label}>Today's Steps:</Text>
                        <RNTextInput
                            style={styles.input}
                            value={String(alreadyWalkedSteps + sessionSteps)}
                            onChangeText={text => setAlreadyWalkedSteps(Number(text) || 0)}
                            keyboardType="number-pad"
                            editable={!isTracking}
                        />
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.label}>Remaining:</Text>
                        <Text style={styles.remainingSteps}>{targetStepsForRoute}</Text>
                    </View>
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity
                    onPress={handleGenerateRoute}
                    disabled={isLoading || !currentLocation || targetStepsForRoute <= 0}
                    style={[styles.button, (isLoading || !currentLocation || targetStepsForRoute <= 0) && styles.buttonDisabled]}
                >
                    <Text style={styles.buttonText}>Generate Route</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSaveRoute}
                    disabled={isLoading || isTracking || sessionSteps === 0}
                    style={[styles.button, styles.saveButton, (isLoading || isTracking || sessionSteps === 0) && styles.buttonDisabled]}
                >
                    <Text style={styles.buttonText}>Save Walk</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const darkMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    map: { flex: 1 },
    mapPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#242f3e',
    },
    mapPlaceholderText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#FFFFFF', marginTop: 10 },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderColor: '#374151',
    },
    goalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2DD4BF', textAlign: 'center', marginBottom: 12 },
    progressBarBackground: { height: 16, backgroundColor: '#374151', borderRadius: 8, width: '100%', marginBottom: 16, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#2DD4BF', borderRadius: 8 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    label: { color: '#D1D5DB', fontSize: 16, marginBottom: 4 },
    input: { color: '#2DD4BF', fontSize: 24, fontWeight: 'bold', padding: 8, backgroundColor: '#374151', borderRadius: 8, minWidth: 120, textAlign: 'center' },
    remainingSteps: { color: '#2DD4BF', fontSize: 32, fontWeight: 'bold' },
    errorText: { color: '#F87171', textAlign: 'center', marginBottom: 12 },
    button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#2DD4BF', marginBottom: 10 },
    buttonDisabled: { backgroundColor: '#4B5563' },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    saveButton: { backgroundColor: '#06B6D4' }
});

export default HomePage;
