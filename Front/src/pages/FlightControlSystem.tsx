import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as L from 'leaflet';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    Circle,
    useMap,
    LayerGroup,
    useMapEvents,
    CircleMarker,
    Tooltip,
    ZoomControl
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlane,
    faPlaneArrival,
    faPlaneDeparture,
    faCloudSun,
    faWind,
    faTemperatureHigh,
    faEye,
    faLayerGroup,
    faInfoCircle,
    faUsers,
    faExclamationTriangle,
    faHistory,
    faFilter,
    faSearch,
    faMapMarkedAlt,
    faChartBar,
    faCloudRain,
    faSyncAlt,
    faCompress,
    faExpand,
    faDotCircle,
    faMountain,
    faGlobe,
    faMoon,
    faSun,
    faClock,
    faChartLine,
    faToggleOn,
    faToggleOff,
    faThumbsUp,
    faThumbsDown,
    faExclamationCircle,
    faBell,
    faDatabase,
    faCloudDownloadAlt,
    faCloud,
    faSnowflake,
    faSmog,
    faBolt,
    faRunning,
    faArrowRight,
    faArrowUp,
    faArrowDown,
    faCog,
    faCompass
} from '@fortawesome/free-solid-svg-icons';

// ENHANCED TYPE DEFINITIONS
// (Type definitions remain the same as in the original code)
// Flight status types
const FlightStatus = ['Scheduled', 'In Progress', 'Delayed', 'Cancelled', 'Landed', 'Boarding', 'Taxiing', 'Emergency', 'Diverted'];
const WeatherCondition = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm', 'Snow', 'Fog', 'Dust', 'Haze'];
const VisibilityCondition = ['Good', 'Moderate', 'Poor', 'Very Poor', 'Zero'];
const MaintenanceStatus = ['Good', 'Needs Attention', 'Due Soon', 'Overdue', 'In Maintenance'];
const RunwayStatus = ['Open', 'Closed', 'Limited', 'Snow Removal', 'Under Maintenance'];
const AlertLevel = ['Info', 'Warning', 'Critical', 'Emergency'];

// COMPREHENSIVE WEATHER ICONS MAPPING
const weatherIcons = {
    'Clear': faSun,
    'Partly Cloudy': faCloudSun,
    'Cloudy': faCloud,
    'Rain': faCloudRain,
    'Thunderstorm': faBolt,
    'Snow': faSnowflake,
    'Fog': faSmog,
    'Dust': faSmog,
    'Haze': faSmog
};

// ENHANCED MAP STYLES WITH ADDITIONAL OPTIONS
const mapStyles = {
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
    light: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    aviation: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
    hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    traffic: 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
};

// Helper functions
// Calculate a flight path between two airports
const calculateFlightRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): [number, number][] => {
    if (!origin || !destination) return [];

    const startLat = origin.lat;
    const startLng = origin.lng;
    const endLat = destination.lat;
    const endLng = destination.lng;

    // Simple great circle approximation with 20 points
    const points = 20;
    const route: [number, number][] = [];

    for (let i = 0; i <= points; i++) {
        const fraction = i / points;

        // Simple linear interpolation - in a real app, use proper great circle calculation
        const lat = startLat + fraction * (endLat - startLat);
        const lng = startLng + fraction * (endLng - startLng);

        // Add some randomness to make it look more realistic
        const randomFactor = Math.random() * 0.01;
        const adjustedLat = lat + (Math.random() > 0.5 ? randomFactor : -randomFactor);
        const adjustedLng = lng + (Math.random() > 0.5 ? randomFactor : -randomFactor);

        route.push([adjustedLat, adjustedLng]);
    }

    return route;
};

// Calculate position along a route based on progress
const calculatePositionAlongRoute = (route: [number, number][], progress: number): { position: [number, number]; heading: number } => {
    if (!route || route.length === 0) {
        return { position: [0, 0], heading: 0 };
    }

    // Ensure progress is between 0 and 1
    const clampedProgress = Math.min(1, Math.max(0, progress));

    // Get the index in the route based on progress
    const index = Math.floor(clampedProgress * (route.length - 1));

    // Handle edge case where we're at the end of the route
    if (index >= route.length - 1) {
        return {
            position: route[route.length - 1],
            heading: 0
        };
    }

    // Get current position
    const position = route[index];

    // Calculate heading based on current and next position
    const nextPosition = route[index + 1];
    const deltaLat = nextPosition[0] - position[0];
    const deltaLng = nextPosition[1] - position[1];
    const heading = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);

    return {
        position,
        heading: (heading + 360) % 360 // Normalize to 0-360
    };
};

// ENHANCED AIRPORTS DATA (IRANIAN AIRPORTS)
const airports = {
    THR: {
        lat: 35.6892,
        lng: 51.3890,
        name: 'Mehrabad International Airport',
        code: 'THR',
        city: 'Tehran',
        country: 'Iran',
        elevation: 1200,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 4,
            details: [
                { id: 'T1', name: 'Terminal 1', gates: 8, international: false },
                { id: 'T2', name: 'Terminal 2', gates: 10, international: true },
                { id: 'T3', name: 'Terminal 3', gates: 6, international: false },
                { id: 'T4', name: 'Terminal 4', gates: 4, international: false }
            ]
        },
        runways: [
            { id: '29L-11R', length: 4030, width: 45, direction: '290-110', status: 'Open', surface: 'Asphalt', lighting: true, ils: true },
            { id: '29R-11L', length: 3660, width: 45, direction: '290-110', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 28,
            visibility: 'Good',
            windSpeed: 5,
            windDirection: 270,
            pressureHPA: 1013,
            ceiling: 32000,
            forecast: [
                { time: '2h', conditions: 'Clear', temperature: 30 },
                { time: '4h', conditions: 'Partly Cloudy', temperature: 31 },
                { time: '6h', conditions: 'Partly Cloudy', temperature: 29 }
            ]
        },
        traffic: {
            inbound: 12,
            outbound: 15,
            ground: 8,
            capacity: 45,
            peak: {
                time: '12:00-14:00',
                volume: 38
            }
        },
        delays: {
            departure: 12,
            arrival: 8,
            security: 15,
            taxiing: 6
        },
        frequencies: {
            tower: '118.300',
            ground: '121.700',
            approach: '119.100',
            departure: '126.650',
            atis: '128.800'
        },
        facilities: {
            fuelTypes: ['Jet-A1', 'AvGas'],
            maintenance: true,
            cargo: true,
            deicing: true
        },
        stats: {
            dailyFlights: 120,
            onTimePerformance: 78
        }
    },
    IKA: {
        lat: 35.4086,
        lng: 51.1522,
        name: 'Imam Khomeini International Airport',
        code: 'IKA',
        city: 'Tehran',
        country: 'Iran',
        elevation: 1007,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 3,
            details: [
                { id: 'T1', name: 'Terminal 1', gates: 13, international: true },
                { id: 'T2', name: 'Terminal 2', gates: 10, international: true },
                { id: 'T3', name: 'Terminal 3 (Salam)', gates: 8, international: true }
            ]
        },
        runways: [
            { id: '11L-29R', length: 4250, width: 60, direction: '110-290', status: 'Open', surface: 'Concrete', lighting: true, ils: true },
            { id: '11R-29L', length: 4250, width: 60, direction: '110-290', status: 'Open', surface: 'Concrete', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Partly Cloudy',
            temperature: 27,
            visibility: 'Good',
            windSpeed: 8,
            windDirection: 120,
            pressureHPA: 1012,
            ceiling: 15000
        },
        traffic: {
            inbound: 18,
            outbound: 22,
            ground: 14,
            capacity: 70
        },
        delays: {
            departure: 18,
            arrival: 15,
            security: 25
        },
        frequencies: {
            tower: '118.100',
            ground: '121.600',
            approach: '119.700',
            departure: '127.100',
            atis: '126.900'
        },
        facilities: {
            fuelTypes: ['Jet-A1'],
            maintenance: true,
            cargo: true,
            deicing: true
        },
        stats: {
            dailyFlights: 185,
            onTimePerformance: 81
        }
    },
    MHD: {
        lat: 36.2605,
        lng: 59.6168,
        name: 'Mashhad International Airport',
        code: 'MHD',
        city: 'Mashhad',
        country: 'Iran',
        elevation: 980,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 2,
            details: [
                { id: 'T1', name: 'Terminal 1', gates: 8, international: false },
                { id: 'T2', name: 'Terminal 2', gates: 10, international: true }
            ]
        },
        runways: [
            { id: '13-31', length: 3920, width: 45, direction: '130-310', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Partly Cloudy',
            temperature: 24,
            visibility: 'Good',
            windSpeed: 7,
            windDirection: 140
        },
        traffic: {
            inbound: 14,
            outbound: 16,
            ground: 10,
            capacity: 45
        },
        delays: {
            departure: 10,
            arrival: 5,
            security: 12
        }
    },
    ISF: {
        lat: 32.7502,
        lng: 51.6746,
        name: 'Isfahan International Airport',
        code: 'ISF',
        city: 'Isfahan',
        country: 'Iran',
        elevation: 1550,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 6, international: true }
            ]
        },
        runways: [
            { id: '08-26', length: 3680, width: 45, direction: '080-260', status: 'Open', surface: 'Concrete', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 31,
            visibility: 'Good',
            windSpeed: 5,
            windDirection: 90
        },
        traffic: {
            inbound: 7,
            outbound: 9,
            ground: 5,
            capacity: 25
        },
        delays: {
            departure: 5,
            arrival: 3,
            security: 8
        }
    },
    SYZ: {
        lat: 29.5390,
        lng: 52.5898,
        name: 'Shiraz International Airport',
        code: 'SYZ',
        city: 'Shiraz',
        country: 'Iran',
        elevation: 1520,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 2,
            details: [
                { id: 'T1', name: 'Domestic Terminal', gates: 6, international: false },
                { id: 'T2', name: 'International Terminal', gates: 4, international: true }
            ]
        },
        runways: [
            { id: '12-30', length: 4030, width: 45, direction: '120-300', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 32,
            visibility: 'Good',
            windSpeed: 6,
            windDirection: 130
        },
        traffic: {
            inbound: 10,
            outbound: 12,
            ground: 6,
            capacity: 30
        },
        delays: {
            departure: 8,
            arrival: 6,
            security: 10
        }
    },
    TBZ: {
        lat: 38.1339,
        lng: 46.2350,
        name: 'Tabriz International Airport',
        code: 'TBZ',
        city: 'Tabriz',
        country: 'Iran',
        elevation: 1363,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 5, international: true }
            ]
        },
        runways: [
            { id: '03-21', length: 3800, width: 45, direction: '030-210', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Cloudy',
            temperature: 22,
            visibility: 'Good',
            windSpeed: 9,
            windDirection: 40
        },
        traffic: {
            inbound: 6,
            outbound: 8,
            ground: 3,
            capacity: 20
        },
        delays: {
            departure: 4,
            arrival: 2,
            security: 7
        }
    },
    AWZ: {
        lat: 31.3404,
        lng: 48.7623,
        name: 'Ahvaz International Airport',
        code: 'AWZ',
        city: 'Ahvaz',
        country: 'Iran',
        elevation: 22,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 4, international: true }
            ]
        },
        runways: [
            { id: '12-30', length: 3500, width: 45, direction: '120-300', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 36,
            visibility: 'Good',
            windSpeed: 4,
            windDirection: 130
        },
        traffic: {
            inbound: 5,
            outbound: 7,
            ground: 3,
            capacity: 18
        },
        delays: {
            departure: 3,
            arrival: 2,
            security: 5
        }
    },
    BND: {
        lat: 27.2127,
        lng: 56.3780,
        name: 'Bandar Abbas International Airport',
        code: 'BND',
        city: 'Bandar Abbas',
        country: 'Iran',
        elevation: 9,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 4, international: true }
            ]
        },
        runways: [
            { id: '03-21', length: 3940, width: 45, direction: '030-210', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 34,
            visibility: 'Good',
            windSpeed: 5,
            windDirection: 40
        },
        traffic: {
            inbound: 4,
            outbound: 6,
            ground: 2,
            capacity: 15
        },
        delays: {
            departure: 2,
            arrival: 1,
            security: 4
        }
    },
    KIH: {
        lat: 26.5264,
        lng: 53.9800,
        name: 'Kish International Airport',
        code: 'KIH',
        city: 'Kish Island',
        country: 'Iran',
        elevation: 35,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 2,
            details: [
                { id: 'T1', name: 'Domestic Terminal', gates: 4, international: false },
                { id: 'T2', name: 'International Terminal', gates: 4, international: true }
            ]
        },
        runways: [
            { id: '08-26', length: 3660, width: 45, direction: '080-260', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 35,
            visibility: 'Good',
            windSpeed: 6,
            windDirection: 90
        },
        traffic: {
            inbound: 8,
            outbound: 10,
            ground: 4,
            capacity: 25
        },
        delays: {
            departure: 6,
            arrival: 4,
            security: 9
        }
    },
    ZAH: {
        lat: 29.4715,
        lng: 60.9062,
        name: 'Zahedan International Airport',
        code: 'ZAH',
        city: 'Zahedan',
        country: 'Iran',
        elevation: 1370,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 3, international: true }
            ]
        },
        runways: [
            { id: '17-35', length: 3500, width: 45, direction: '170-350', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 31,
            visibility: 'Good',
            windSpeed: 8,
            windDirection: 180
        },
        traffic: {
            inbound: 2,
            outbound: 3,
            ground: 1,
            capacity: 10
        },
        delays: {
            departure: 1,
            arrival: 1,
            security: 3
        }
    },
    RAS: {
        lat: 37.3253,
        lng: 49.6178,
        name: 'Rasht Airport',
        code: 'RAS',
        city: 'Rasht',
        country: 'Iran',
        elevation: -9,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 3, international: false }
            ]
        },
        runways: [
            { id: '09-27', length: 2400, width: 45, direction: '090-270', status: 'Open', surface: 'Asphalt', lighting: true, ils: false }
        ],
        weather: {
            conditions: 'Rain',
            temperature: 22,
            visibility: 'Moderate',
            windSpeed: 10,
            windDirection: 100
        },
        traffic: {
            inbound: 3,
            outbound: 4,
            ground: 2,
            capacity: 12
        },
        delays: {
            departure: 2,
            arrival: 1,
            security: 4
        }
    },
    BUZ: {
        lat: 28.9459,
        lng: 50.8344,
        name: 'Bushehr Airport',
        code: 'BUZ',
        city: 'Bushehr',
        country: 'Iran',
        elevation: 20,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 3, international: true }
            ]
        },
        runways: [
            { id: '12-30', length: 3200, width: 45, direction: '120-300', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 32,
            visibility: 'Good',
            windSpeed: 6,
            windDirection: 130
        },
        traffic: {
            inbound: 3,
            outbound: 4,
            ground: 1,
            capacity: 12
        },
        delays: {
            departure: 3,
            arrival: 2,
            security: 5
        }
    },
    KER: {
        lat: 30.2650,
        lng: 56.9542,
        name: 'Kerman Airport',
        code: 'KER',
        city: 'Kerman',
        country: 'Iran',
        elevation: 1754,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 4, international: true }
            ]
        },
        runways: [
            { id: '16-34', length: 3600, width: 45, direction: '160-340', status: 'Open', surface: 'Asphalt', lighting: true, ils: true }
        ],
        weather: {
            conditions: 'Clear',
            temperature: 30,
            visibility: 'Good',
            windSpeed: 4,
            windDirection: 170
        },
        traffic: {
            inbound: 4,
            outbound: 5,
            ground: 2,
            capacity: 14
        },
        delays: {
            departure: 2,
            arrival: 1,
            security: 5
        }
    },
    GBT: {
        lat: 36.9092,
        lng: 54.4013,
        name: 'Gorgan Airport',
        code: 'GBT',
        city: 'Gorgan',
        country: 'Iran',
        elevation: 121,
        timezone: 'Asia/Tehran',
        terminals: {
            count: 1,
            details: [
                { id: 'T1', name: 'Main Terminal', gates: 2, international: false }
            ]
        },
        runways: [
            { id: '12-30', length: 2700, width: 45, direction: '120-300', status: 'Open', surface: 'Asphalt', lighting: true, ils: false }
        ],
        weather: {
            conditions: 'Partly Cloudy',
            temperature: 26,
            visibility: 'Good',
            windSpeed: 5,
            windDirection: 130
        },
        traffic: {
            inbound: 2,
            outbound: 3,
            ground: 1,
            capacity: 8
        },
        delays: {
            departure: 1,
            arrival: 0,
            security: 3
        }
    }
};

// SAMPLE FLIGHTS DATA GENERATION FUNCTION
const generateSampleFlights = (airports: Record<string, any>): any[] => {
    const flightStatuses = ['Scheduled', 'In Progress', 'Delayed', 'Cancelled', 'Landed', 'Boarding', 'Taxiing'];
    const airportCodes = Object.keys(airports);
    const flights = [];

    // Generate 30 sample flights with realistic data
    for (let i = 0; i < 30; i++) {
        // Select random airports for origin and destination
        const originIdx = Math.floor(Math.random() * airportCodes.length);
        let destIdx = Math.floor(Math.random() * airportCodes.length);
        while (destIdx === originIdx) {
            destIdx = Math.floor(Math.random() * airportCodes.length);
        }

        const originCode = airportCodes[originIdx];
        const destCode = airportCodes[destIdx];
        const origin = airports[originCode];
        const destination = airports[destCode];

        // Calculate flight path
        const flightPath = calculateFlightRoute(origin, destination);

        // Randomize flight progress
        const progress = Math.random();
        const { position, heading } = calculatePositionAlongRoute(flightPath, progress);

        // Generate a random flight
        const flight = {
            id: `FL${1000 + i}`,
            flightNumber: `IR${100 + Math.floor(Math.random() * 900)}`,
            origin: originCode,
            destination: destCode,
            status: flightStatuses[Math.floor(Math.random() * flightStatuses.length)],
            scheduledDeparture: new Date(Date.now() - Math.random() * 3600000 * 6).toISOString(),
            scheduledArrival: new Date(Date.now() + Math.random() * 3600000 * 6).toISOString(),
            coordinates: {
                latitude: position[0],
                longitude: position[1],
                altitude: 25000 + Math.random() * 15000,
                heading: heading,
                speed: 400 + Math.random() * 150,
                verticalSpeed: Math.random() > 0.7 ? (Math.random() * 1000 - 500) : 0
            },
            flightPath: {
                planned: flightPath,
                actual: flightPath.slice(0, Math.ceil(flightPath.length * progress))
            },
            passengers: {
                total: Math.floor(Math.random() * 150) + 50
            },
            crew: {
                captain: "Capt. " + ["Ali", "Reza", "Mohammad", "Hassan", "Amir"][Math.floor(Math.random() * 5)],
                firstOfficer: "F/O " + ["Sara", "Mina", "Arash", "Soheil", "Parsa"][Math.floor(Math.random() * 5)]
            },
            cargo: {
                baggageCount: Math.floor(Math.random() * 100) + 50,
                cargoWeight: Math.floor(Math.random() * 5000) + 1000
            },
            fuel: {
                currentLevel: Math.floor(Math.random() * 70) + 30
            },
            maintenance: {
                status: Math.random() > 0.9 ? 'Needs Attention' : 'Good'
            },
            progress: progress * 100,
            flightPhase: progress < 0.1 ? 'Climb' : progress < 0.8 ? 'Cruise' : 'Descent'
        };

        flights.push(flight);
    }

    return flights;
};

// Sample flight alerts
const generateFlightAlerts = (flights: any[]): { flightId: string; level: string; message: string; timestamp: string }[] => {
    const alerts = [];
    const alertTypes = [
        { level: 'Info', message: 'Flight is operating normally.' },
        { level: 'Warning', message: 'Minor delay expected due to air traffic.' },
        { level: 'Warning', message: 'Weather conditions may cause turbulence.' },
        { level: 'Critical', message: 'Flight delayed due to technical issues.' },
        { level: 'Emergency', message: 'Aircraft requires immediate landing due to technical failure.' },
        { level: 'Warning', message: 'Route adjusted due to weather conditions.' }
    ];

    const flightIds = flights.map((f: any) => f.id);
    const alertCount = Math.floor(Math.random() * 5) + 2; // 2-6 alerts

    for (let i = 0; i < alertCount; i++) {
        const randomFlightIndex = Math.floor(Math.random() * flightIds.length);
        const flightId = flightIds[randomFlightIndex];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        alerts.push({
            flightId,
            level: alert.level,
            message: alert.message,
            timestamp: new Date().toISOString()
        });

        // Remove the selected flight to prevent duplicate alerts
        flightIds.splice(randomFlightIndex, 1);
    }

    return alerts;
};

const FlightControlSystem = () => {
    const [flights, setFlights] = useState(() => generateSampleFlights(airports));
    const [alerts, setAlerts] = useState(() => generateFlightAlerts(flights));

    return (
        <div className="h-screen">
            <MapContainer center={[32.4279, 53.6880]} zoom={6} scrollWheelZoom={true} className="h-full z-0">
                <TileLayer url={mapStyles.default} />
                {flights.map((flight) => (
                    <Marker
                        key={flight.id}
                        position={[flight.coordinates.latitude, flight.coordinates.longitude]}
                        icon={L.divIcon({ className: 'custom-icon', html: '✈️' })}
                    >
                        <Popup>
                            <strong>{flight.flightNumber}</strong><br />
                            {flight.origin} → {flight.destination}<br />
                            Status: {flight.status}<br />
                            Altitude: {Math.round(flight.coordinates.altitude)} ft
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FlightControlSystem;