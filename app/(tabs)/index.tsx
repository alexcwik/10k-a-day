// app/(tabs)/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import CollapsibleControlCard from '../../components/CollapsibleControlCard';
import { GOOGLE_MAPS_API_KEY } from '../../constants/ApiKeys';
import { DarkMapStyle } from '../../constants/MapStyles';

const METERS_PER_STEP = 0.762;
const TARGET_STEPS = 10000;

// Default location to use if the emulator's GPS fails.
const DEFAULT_LOCATION = {
    coords: { latitude: 40.785091, longitude: -73.968285, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: Date.now(),
};

const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
};

// Generates a destination point for the route
const generateDestination = (startCoord) => {
    const targetDistance = (TARGET_STEPS * METERS_PER_STEP) / 2; // Go out ~5k steps
    const earthRadius = 6371000;
    const bearing = Math.random() * 360;
    const lat1 = startCoord.latitude * Math.PI / 180;
    const lon1 = startCoord.longitude * Math.PI / 180;
    const brng = bearing * Math.PI / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(targetDistance / earthRadius) + Math.cos(lat1) * Math.sin(targetDistance / earthRadius) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(targetDistance / earthRadius) * Math.cos(lat1), Math.cos(targetDistance / earthRadius) - Math.sin(lat1) * Math.sin(lat2));
    return { latitude: lat2 * 180 / Math.PI, longitude: lon2 * 180 / Math.PI };
}

const getDeviceLocationWithTimeout = (timeout = 5000): Promise<Location.LocationObject> => {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            console.warn("Location request timed out. Using default location.");
            resolve(DEFAULT_LOCATION);
        }, timeout);
        Location.getCurrentPositionAsync({}).then(location => {
            clearTimeout(timer);
            resolve(location);
        }).catch(() => {
            clearTimeout(timer);
            resolve(DEFAULT_LOCATION);
        });
    });
};

const MapScreen = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const mapRef = useRef<MapView>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [generatedPath, setGeneratedPath] = useState<any[]>([]);
    const [destination, setDestination] = useState(null);
    const [userPath, setUserPath] = useState<any[]>([]);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [stepsRemaining, setStepsRemaining] = useState(TARGET_STEPS);

    // --- DEBUGGING STEP 1 ---
    // Log the imported API key to ensure it's not undefined.
    useEffect(() => {
        console.log("Imported Google Maps API Key:", GOOGLE_MAPS_API_KEY ? "Loaded" : "NOT LOADED / UNDEFINED");
    }, []);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            const currentLocation = await getDeviceLocationWithTimeout();
            setLocation(currentLocation);
        })();
    }, []);
    
    useEffect(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    }, [location]);

    useEffect(() => { return () => { locationSubscription.current?.remove(); }; }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRecording) {
            timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [isRecording]);
    
    const saveActivity = async () => {
        const activity = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            distance,
            duration,
            steps: Math.floor(distance / METERS_PER_STEP),
            path: userPath,
        };
        try {
            const existingActivities = await AsyncStorage.getItem('activities');
            const activities = existingActivities ? JSON.parse(existingActivities) : [];
            activities.push(activity);
            await AsyncStorage.setItem('activities', JSON.stringify(activities));
            Alert.alert("Activity Saved!", "Your activity has been saved to your history.");
        } catch (e) {
            console.error("Failed to save activity.", e);
            Alert.alert("Error", "Could not save your activity.");
        }
    };
    
    const startWatching = async () => {
        locationSubscription.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 10 },
            (newLocation) => {
                const newCoord = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
                setUserPath((currentPath) => {
                    const updatedPath = [...currentPath, newCoord];
                    if(updatedPath.length > 1) {
                        const lastCoord = updatedPath[updatedPath.length - 2];
                        const newDistance = haversineDistance(lastCoord, newCoord);
                        const newSteps = Math.floor(newDistance / METERS_PER_STEP);
                        setDistance((d) => d + newDistance);
                        setStepsRemaining(s => Math.max(0, s - newSteps));
                    }
                    return updatedPath;
                });
            }
        );
    };

    const handleStartStopRecording = () => {
        if (isRecording) {
            locationSubscription.current?.remove();
            if (distance > 50) {
                saveActivity();
            }
        } else {
            setUserPath(location ? [{ latitude: location.coords.latitude, longitude: location.coords.longitude }] : []);
            setDistance(0);
            setDuration(0);
            if (generatedPath.length > 0) {
                setStepsRemaining(TARGET_STEPS);
            }
            startWatching();
        }
        setIsRecording(!isRecording);
    };

    const handleGenerateRoute = () => {
        if (!location) return;
        const startCoord = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        const dest = generateDestination(startCoord);
        setDestination(dest);
        setStepsRemaining(TARGET_STEPS);
        setUserPath([]);
    };

    if (!location) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#ffffff" /></View>;
    }

    return (
        <View style={styles.container}>
            <MapView ref={mapRef} style={StyleSheet.absoluteFillObject} provider={PROVIDER_GOOGLE} initialRegion={{latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }} customMapStyle={DarkMapStyle} showsUserLocation={true}>
                {destination && (
                    <MapViewDirections
                        origin={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                        destination={destination}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={5}
                        strokeColor="#007AFF"
                        mode="WALKING"
                        avoidHighways
                        avoidTolls
                        avoidFerries
                        onReady={result => {
                            setGeneratedPath(result.coordinates);
                            mapRef.current?.fitToCoordinates(result.coordinates, {
                                edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
                            });
                        }}
                        // --- DEBUGGING STEP 2 ---
                        // This will catch and log the specific error from Google.
                        onError={(errorMessage) => {
                            console.error("MapViewDirections Error:", errorMessage);
                            Alert.alert("Route Error", "Could not generate route. Please check your API key and Google Cloud settings.");
                        }}
                    />
                )}
                {userPath.length > 0 && <Polyline coordinates={userPath} strokeColor="#FF3B30" strokeWidth={4} />}
            </MapView>
            
            {generatedPath.length > 0 && (
                <View style={styles.stepsContainer}>
                    <Text style={styles.stepsText}>{stepsRemaining.toLocaleString()} Steps Remaining</Text>
                </View>
            )}

            <CollapsibleControlCard isRecording={isRecording} onStartStop={handleStartStopRecording} onGenerateRoute={handleGenerateRoute} distance={distance} duration={duration}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1e' },
    stepsContainer: { position: 'absolute', top: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, },
    stepsText: { color: '#34C759', fontSize: 16, fontWeight: 'bold' }
});

export default MapScreen;