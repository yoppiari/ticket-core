'use client';

import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    onLocationChange: (lat: number, lng: number, address?: string) => void;
    initialAddress?: string;
}

export default function LocationPicker({ latitude, longitude, onLocationChange, initialAddress }: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [searchQuery, setSearchQuery] = useState(initialAddress || '');
    const [isSearching, setIsSearching] = useState(false);

    // Default to Jakarta if no coordinates provided
    const defaultCenter = { lat: -6.2088, lng: 106.8456 };
    const initialLat = latitude || defaultCenter.lat;
    const initialLng = longitude || defaultCenter.lng;

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Fix for default marker icon
        // @ts-expect-error -- Fixing default icon path issue in Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

        marker.on('dragend', () => {
            const { lat, lng } = marker.getLatLng();
            onLocationChange(lat, lng);
        });

        // Add click handler to map to move marker
        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            onLocationChange(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Update marker if props change (optional, depending on if we want external control)
    useEffect(() => {
        if (latitude && longitude && markerRef.current && mapInstanceRef.current) {
            const currentLatLng = markerRef.current.getLatLng();
            // Only update if significantly different to avoid loop/jitter
            if (Math.abs(currentLatLng.lat - latitude) > 0.0001 || Math.abs(currentLatLng.lng - longitude) > 0.0001) {
                const newLatLng = new L.LatLng(latitude, longitude);
                markerRef.current.setLatLng(newLatLng);
                mapInstanceRef.current.setView(newLatLng);
            }
        }
    }, [latitude, longitude]);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);

                const newLatLng = new L.LatLng(newLat, newLng);

                if (mapInstanceRef.current && markerRef.current) {
                    markerRef.current.setLatLng(newLatLng);
                    mapInstanceRef.current.flyTo(newLatLng, 15);
                    onLocationChange(newLat, newLng, display_name);
                }
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    placeholder="Search venue or address..."
                    className="flex-1 px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isSearching}
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>

            <div className="h-[400px] w-full rounded-xl overflow-hidden border dark:border-zinc-800 z-0 relative">
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            </div>

            <div className="text-xs text-zinc-500 flex justify-between">
                <span>Drag the pin or click on map to adjust location.</span>
                <span>Lat: {latitude?.toString() || initialLat}, Lng: {longitude?.toString() || initialLng}</span>
            </div>
        </div>
    );
}
