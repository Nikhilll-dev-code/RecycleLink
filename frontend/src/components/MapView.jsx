import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 17.3850,
    lng: 78.4867
};

function MapComponent({ center, markers, selectable, onLocationSelect, apiKey }) {
    const [map, setMap] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    });

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const handleClick = (e) => {
        if (selectable && onLocationSelect) {
            onLocationSelect({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            });
        }
    };

    if (loadError) return <div style={{ background: '#f3f4f6', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>Google Maps failed to load</div>;
    if (!isLoaded) return <div style={{ background: '#f3f4f6', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>Loading map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleClick}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
            }}
        >
            {markers.map((m, i) => (
                <Marker
                    key={i}
                    position={{ lat: m.lat, lng: m.lng }}
                    label={m.label}
                    icon={m.icon}
                />
            ))}
        </GoogleMap>
    );
}

export default function MapView({
    center = defaultCenter,
    markers = [],
    selectable = false,
    onLocationSelect
}) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
        console.warn("VITE_GOOGLE_MAPS_API_KEY is missing. Google Maps might not render correctly.");
    }

    return (
        <MapComponent
            center={center}
            markers={markers}
            selectable={selectable}
            onLocationSelect={onLocationSelect}
            apiKey={apiKey}
        />
    );
}
