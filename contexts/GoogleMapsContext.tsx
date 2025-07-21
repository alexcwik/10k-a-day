// contexts/GoogleMapsContext.tsx
import React, { createContext, ReactNode, useContext } from 'react';

// This context is simpler in Native. It mainly can hold the API key if needed elsewhere.
const GoogleMapsContext = createContext(null);

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
    children: ReactNode;
}

export const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps) => {
    // The main purpose is to be a provider wrapper.
    // API key is now set directly in AndroidManifest.xml and AppDelegate.m
    // or passed to the MapView component if needed.
    return (
        <GoogleMapsContext.Provider value={null}>
            {children}
        </GoogleMapsContext.Provider>
    );
};