import React, { useState, useEffect } from 'react';
import LiveFlights from './LiveFlights';
import FlightRadar from './FlightRadar';

type Flight = {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  groundSpeed: number;
  status: string;
  aircraft?: string;
  airline?: string;
  estimatedArrival?: string;
  scheduledDeparture?: string;
  progress?: number;
};

const FlightMonitoringPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'radar'>('list');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number]>([35.6892, 51.3890]); // Tehran by default
  
  // Fetch flight data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulated API call
        // In production, replace with real API call
        setTimeout(() => {
          // Generate mock flight data
          const mockFlights: Flight[] = Array.from({ length: 25 }, (_, i) => ({
            id: `flight-${i + 1}`,
            flightNumber: `KA${100 + i}`,
            origin: ['THR', 'MHD', 'SYZ', 'IFN', 'AWZ', 'TBZ'][Math.floor(Math.random() * 6)],
            destination: ['THR', 'MHD', 'SYZ', 'IFN', 'AWZ', 'TBZ'][Math.floor(Math.random() * 6)],
            latitude: 35.6892 + (Math.random() - 0.5) * 4,
            longitude: 51.3890 + (Math.random() - 0.5) * 4,
            altitude: Math.floor(Math.random() * 40000) + 5000,
            heading: Math.floor(Math.random() * 360),
            groundSpeed: Math.floor(Math.random() * 500) + 300,
            status: ['In Air', 'Landing', 'Delayed', 'Scheduled'][Math.floor(Math.random() * 4)],
            aircraft: ['Airbus A320', 'Boeing 737', 'Airbus A319'][Math.floor(Math.random() * 3)],
            airline: ['Iran Air', 'Mahan Air', 'Kish Air', 'Aseman Airlines'][Math.floor(Math.random() * 4)],
            estimatedArrival: new Date(Date.now() + Math.random() * 5 * 60 * 60 * 1000).toISOString(),
            scheduledDeparture: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
            progress: Math.floor(Math.random() * 100),
          }));
          
          setFlights(mockFlights);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('خطا در دریافت اطلاعات پروازها');
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Center radar on selected flight
  useEffect(() => {
    if (selectedFlight) {
      setCenterPosition([selectedFlight.latitude, selectedFlight.longitude]);
    }
  }, [selectedFlight]);
  
  const handleFlightSelect = (flight: Flight | null) => {
    setSelectedFlight(flight);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">سامانه مانیتورینگ پروازها</h1>
          <p className="text-sm text-gray-500">مشاهده و ردیابی پروازهای جاری</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border">
            <button 
              className={`px-4 py-2 ${viewMode === 'list' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-800' : 'bg-white')}`}
              onClick={() => setViewMode('list')}
            >
              لیست پروازها
            </button>
            <button 
              className={`px-4 py-2 ${viewMode === 'radar' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-800' : 'bg-white')}`}
              onClick={() => setViewMode('radar')}
            >
              رادار
            </button>
          </div>
          
          <button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-white border'}`}
            onClick={() => setDarkMode(prev => !prev)}
            title={darkMode ? 'روشن' : 'تاریک'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <main className="p-4">
        {loading && !flights.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-bold">خطا در دریافت اطلاعات</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-150px)]">
            {viewMode === 'list' ? (
              // Use your existing LiveFlights component
              <div className="h-full">
                <LiveFlights />
              </div>
            ) : (
              // Use the new FlightRadar component
              <div className="h-full">
                <div className={`p-4 h-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="h-full">
                    <FlightRadar 
                      flights={flights}
                      centerPosition={centerPosition}
                      darkMode={darkMode}
                      showLabels={true}
                      onFlightSelect={setSelectedFlight}
                      selectedFlight={selectedFlight}
                      range={200}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* نمایش اطلاعات خلاصه در پایین صفحه */}
      <footer className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
        <div className="flex flex-wrap justify-between items-center">
          <div className="text-sm">
            <span className="font-bold">{flights.length}</span> پرواز فعال
            {' | '}
            <span className="font-bold">{flights.filter(f => f.status === 'In Air').length}</span> در حال پرواز
            {' | '}
            <span className="font-bold">{flights.filter(f => f.status === 'Delayed').length}</span> تاخیری
          </div>
          
          <div className="text-xs">
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlightMonitoringPage;