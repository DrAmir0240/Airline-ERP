import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotatedmarker'; // Add this import for rotation support

// Extend Leaflet Marker type to include rotation
declare module 'leaflet' {
  interface Marker {
    setRotationAngle(angle: number): void;
  }
}

// Airplane marker icon
const createAirplaneIcon = () => L.divIcon({
  className: 'custom-airplane-icon',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 10h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
      <path d="M9 14H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3" />
      <path d="M12 9v7" />
      <path d="M9 12H4" />
      <path d="M16 12h5" />
    </svg>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Air': return 'text-green-500';
    case 'Landing': return 'text-blue-500';
    case 'Take Off': return 'text-yellow-500';
    case 'Delayed': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

// Comprehensive Flight type to match your use case
export interface Flight {
  id: string;
  flightNumber: string;
  latitude: number;
  longitude: number;
  heading?: number;
  status: string;
  origin?: string;
  destination?: string;
  aircraft?: string;
  scheduledDeparture?: string;
  scheduledArrival?: string;
}

type FlightMapLiveProps = {
  flights: Flight[];
  center?: [number, number];
  zoom?: number;
};
const flights = [
  {
    id: 'flight1',
    flightNumber: 'KA203',
    latitude: 35.6892,
    longitude: 51.3890,
    heading: 45,
    status: 'In Air',
    // Optional properties
    origin: 'Tehran',
    destination: 'Istanbul'
  }
];

const FlightMapLive: React.FC<FlightMapLiveProps> = ({
  flights,
  center = [35.6892, 51.3890], // Tehran default center
  zoom = 5
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    // Initialize map if not already created
    if (!mapRef.current) {
      const mapElement = document.getElementById('flight-map');
      if (mapElement) {
        mapRef.current = L.map('flight-map', {
          center: center,
          zoom: zoom,
          zoomControl: false,
          attributionControl: false
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
      }
    }

    // Validate and prepare flights data
    const validFlights = flights.map(flight => ({
      ...flight,
      latitude: flight.latitude ?? 0,
      longitude: flight.longitude ?? 0,
      heading: flight.heading ?? 0
    }));

    // Update or create markers for each flight
    validFlights.forEach(flight => {
      const existingMarker = markersRef.current[flight.id];

      // Create new marker if not exists
      if (!existingMarker) {
        const marker = L.marker([flight.latitude, flight.longitude], {
          icon: createAirplaneIcon(),
          rotationAngle: flight.heading,
          rotationOrigin: 'center center'
        } as L.MarkerOptions).addTo(mapRef.current!);

        // Add popup with flight details
        marker.bindPopup(`
          <div class="p-2">
            <div class="font-bold text-lg mb-1">${flight.flightNumber}</div>
            <div class="${getStatusColor(flight.status)}">${flight.status}</div>
            ${flight.origin ? `<div class="text-sm">از: ${flight.origin}</div>` : ''}
            ${flight.destination ? `<div class="text-sm">به: ${flight.destination}</div>` : ''}
          </div>
        `);

        markersRef.current[flight.id] = marker;
      } else {
        // Update existing marker position and rotation
        existingMarker.setLatLng([flight.latitude, flight.longitude]);

        // Use type assertion to handle rotation
        (existingMarker as any).setRotationAngle(flight.heading);
      }
    });

    // Remove markers for flights no longer in the list
    Object.keys(markersRef.current).forEach(id => {
      if (!validFlights.some(flight => flight.id === id)) {
        mapRef.current!.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Update map center and zoom if needed
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }

    // Cleanup function
    return () => {
      // Remove markers if component unmounts
      Object.values(markersRef.current).forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = {};
    };
  }, [flights, center, zoom]);

  return (
    <div
      id="flight-map"
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    />
  );
};

export default FlightMapLive;