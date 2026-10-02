import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faSearch, faFilter, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom marker icons
const planeIcon = new L.Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'destination-marker' // Can be styled with CSS
});

type Flight = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'On Time' | 'Delayed' | 'Cancelled' | 'Boarding' | 'In Air';
  airline: string;
  flightDuration: string;
};

type Airport = {
  lat: number;
  lng: number;
  name: string;
  code: string;
  city: string;
  country: string;
};

// Extended airports data
const airports: Record<string, Airport> = {
  THR: { lat: 35.6892, lng: 51.3890, name: 'Imam Khomeini International Airport', code: 'THR', city: 'Tehran', country: 'Iran' },
  MHD: { lat: 36.2605, lng: 59.6168, name: 'Mashhad International Airport', code: 'MHD', city: 'Mashhad', country: 'Iran' },
  ISF: { lat: 32.7502, lng: 51.6746, name: 'Isfahan International Airport', code: 'ISF', city: 'Isfahan', country: 'Iran' },
  SYZ: { lat: 29.5390, lng: 52.5898, name: 'Shiraz International Airport', code: 'SYZ', city: 'Shiraz', country: 'Iran' },
  TBZ: { lat: 38.1339, lng: 46.2350, name: 'Tabriz International Airport', code: 'TBZ', city: 'Tabriz', country: 'Iran' },
  AWZ: { lat: 31.3404, lng: 48.7623, name: 'Ahvaz International Airport', code: 'AWZ', city: 'Ahvaz', country: 'Iran' },
  BND: { lat: 27.2127, lng: 56.3780, name: 'Bandar Abbas International Airport', code: 'BND', city: 'Bandar Abbas', country: 'Iran' },
  KIH: { lat: 26.5264, lng: 53.9800, name: 'Kish International Airport', code: 'KIH', city: 'Kish Island', country: 'Iran' },
};

// Extended flights data
const flightsData: Flight[] = [
  {
    id: '1',
    name: 'KA101',
    origin: 'THR',
    destination: 'MHD',
    departureTime: '08:30',
    arrivalTime: '10:00',
    status: 'On Time',
    airline: 'Kish Air',
    flightDuration: '1h 30m'
  },
  {
    id: '2',
    name: 'KA102',
    origin: 'MHD',
    destination: 'ISF',
    departureTime: '11:45',
    arrivalTime: '13:15',
    status: 'Delayed',
    airline: 'Kish Air',
    flightDuration: '1h 30m'
  },
  {
    id: '3',
    name: 'IR503',
    origin: 'THR',
    destination: 'SYZ',
    departureTime: '09:15',
    arrivalTime: '10:45',
    status: 'In Air',
    airline: 'Iran Air',
    flightDuration: '1h 30m'
  },
  {
    id: '4',
    name: 'W5302',
    origin: 'ISF',
    destination: 'TBZ',
    departureTime: '14:20',
    arrivalTime: '15:40',
    status: 'On Time',
    airline: 'Mahan Air',
    flightDuration: '1h 20m'
  },
  {
    id: '5',
    name: 'EP612',
    origin: 'TBZ',
    destination: 'THR',
    departureTime: '16:30',
    arrivalTime: '18:00',
    status: 'Boarding',
    airline: 'Iran Aseman',
    flightDuration: '1h 30m'
  },
  {
    id: '6',
    name: 'Y9517',
    origin: 'THR',
    destination: 'AWZ',
    departureTime: '07:45',
    arrivalTime: '09:00',
    status: 'Cancelled',
    airline: 'Zagros Airlines',
    flightDuration: '1h 15m'
  },
  {
    id: '7',
    name: 'B9214',
    origin: 'SYZ',
    destination: 'BND',
    departureTime: '10:30',
    arrivalTime: '11:30',
    status: 'On Time',
    airline: 'Caspian Airlines',
    flightDuration: '1h 00m'
  },
  {
    id: '8',
    name: 'IV643',
    origin: 'THR',
    destination: 'KIH',
    departureTime: '13:15',
    arrivalTime: '14:45',
    status: 'Delayed',
    airline: 'Caspian Airlines',
    flightDuration: '1h 30m'
  },
];

// Component to recenter map to show all flights
const FitBounds: React.FC<{ flights: Flight[] }> = ({ flights }) => {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [];

    flights.forEach(flight => {
      const origin = airports[flight.origin];
      const destination = airports[flight.destination];

      if (origin && destination) {
        points.push([origin.lat, origin.lng]);
        points.push([destination.lat, destination.lng]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, flights]);

  return null;
};

// Flight details component
const FlightDetails: React.FC<{ flight: Flight }> = ({ flight }) => {
  const origin = airports[flight.origin];
  const destination = airports[flight.destination];

  // Function to get status color
  const getStatusColor = (status: Flight['status']) => {
    switch (status) {
      case 'On Time': return 'text-green-600';
      case 'Delayed': return 'text-yellow-600';
      case 'Cancelled': return 'text-red-600';
      case 'Boarding': return 'text-blue-600';
      case 'In Air': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-blue-600">{flight.name}</h3>
        <span className={`font-medium ${getStatusColor(flight.status)}`}>{flight.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500 text-sm">از</p>
          <p className="font-medium">{origin.city} ({flight.origin})</p>
          <p className="text-sm text-gray-600">{flight.departureTime}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">به</p>
          <p className="font-medium">{destination.city} ({flight.destination})</p>
          <p className="text-sm text-gray-600">{flight.arrivalTime}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-sm">
        <span>{flight.airline}</span>
        <span className="text-gray-600">مدت پرواز: {flight.flightDuration}</span>
      </div>

      <button
        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded text-sm transition-colors"
        onClick={() => alert(`جزئیات پرواز ${flight.name}`)}
      >
        نمایش جزئیات
      </button>
    </div>
  );
};

const FlightMap: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>(flightsData);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flightsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAirport, setSelectedAirport] = useState<string>('all');
  const [highlightedFlight, setHighlightedFlight] = useState<string | null>(null);

  // Apply filters
  useEffect(() => {
    let filtered = flights;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(flight =>
        flight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airports[flight.origin].city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airports[flight.destination].city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(flight => flight.status === selectedStatus);
    }

    // Apply airport filter
    if (selectedAirport !== 'all') {
      filtered = filtered.filter(flight =>
        flight.origin === selectedAirport || flight.destination === selectedAirport
      );
    }

    setFilteredFlights(filtered);
  }, [searchTerm, selectedStatus, selectedAirport, flights]);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    { value: 'On Time', label: 'به موقع' },
    { value: 'Delayed', label: 'تاخیر' },
    { value: 'Cancelled', label: 'لغو شده' },
    { value: 'Boarding', label: 'در حال سوار شدن' },
    { value: 'In Air', label: 'در هوا' }
  ];

  // Get flight polyline color
  const getFlightColor = (flight: Flight, isHighlighted: boolean) => {
    if (isHighlighted) return '#FF5733'; // Highlighted flight

    switch (flight.status) {
      case 'On Time': return '#4CAF50';
      case 'Delayed': return '#FFC107';
      case 'Cancelled': return '#F44336';
      case 'Boarding': return '#2196F3';
      case 'In Air': return '#9C27B0';
      default: return '#3388ff';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[80vh] w-full" dir="rtl">
      {/* Flight list and filters panel */}
      <div className="w-full md:w-1/3 p-4 bg-gray-100 dark:bg-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">پروازها</h2>

        {/* Search and filters */}
        <div className="mb-4">
          <div className="relative mb-3">
            <input
              type="text"
              className="w-full p-2 pr-8 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              placeholder="جستجو پرواز یا شهر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">وضعیت</label>
              <select
                className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">فرودگاه</label>
              <select
                className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={selectedAirport}
                onChange={(e) => setSelectedAirport(e.target.value)}
              >
                <option value="all">همه فرودگاه‌ها</option>
                {Object.entries(airports).map(([code, airport]) => (
                  <option key={code} value={code}>{airport.city} ({code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Flight list */}
        <div>
          {filteredFlights.length > 0 ? (
            filteredFlights.map(flight => (
              <div
                key={flight.id}
                onMouseEnter={() => setHighlightedFlight(flight.id)}
                onMouseLeave={() => setHighlightedFlight(null)}
              >
                <FlightDetails flight={flight} />
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-600 dark:text-gray-300">هیچ پروازی با این مشخصات یافت نشد.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 h-full">
        <MapContainer
          center={[32.4279, 53.6880]}
          zoom={6}
          scrollWheelZoom
          className="w-full h-full rounded"
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* All airports */}
          {Object.entries(airports).map(([code, airport]) => (
            <Marker
              key={code}
              position={[airport.lat, airport.lng]}
              icon={planeIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{airport.name}</h3>
                  <p>{airport.city}, {airport.country}</p>
                  <p className="text-sm text-gray-600">کد: {code}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Flight routes */}
          {filteredFlights.map((flight) => {
            const origin = airports[flight.origin];
            const destination = airports[flight.destination];
            const isHighlighted = highlightedFlight === flight.id;

            return (
              <React.Fragment key={flight.id}>
                <Polyline
                  positions={[[origin.lat, origin.lng], [destination.lat, destination.lng]]}
                  color={getFlightColor(flight, isHighlighted)}
                  weight={isHighlighted ? 4 : 2}
                  dashArray={flight.status === 'Cancelled' ? '5, 10' : undefined}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{flight.name}</h3>
                      <p>{origin.city} → {destination.city}</p>
                      <p>زمان: {flight.departureTime} - {flight.arrivalTime}</p>
                      <p>وضعیت: {flight.status}</p>
                    </div>
                  </Popup>
                </Polyline>

                {/* Flight midpoint label (could add plane icon here) */}
                {flight.status !== 'Cancelled' && (
                  // You can add a moving plane icon here with custom rotation
                  // This would require more complex logic with useEffect and useState
                  null
                )}
              </React.Fragment>
            );
          })}

          <FitBounds flights={filteredFlights} />
        </MapContainer>
      </div>
    </div>
  );
};

export default FlightMap;