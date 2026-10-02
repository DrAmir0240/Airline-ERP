import React, { useEffect, useState, useCallback } from 'react';
import FlightMapLive from './FlightMapLive';

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
  aircraft: string;
  airline: string;
  estimatedArrival: string;
  scheduledDeparture: string;
  progress: number; // درصد پیشرفت مسیر
};

type AirportFilter = {
  origin: string;
  destination: string;
};

type FlightFilter = {
  airline: string;
  status: string;
  minAltitude: number | null;
  maxAltitude: number | null;
};

export default function LiveFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(10000);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [airportFilter, setAirportFilter] = useState<AirportFilter>({ origin: '', destination: '' });
  const [flightFilter, setFlightFilter] = useState<FlightFilter>({
    airline: '',
    status: '',
    minAltitude: null,
    maxAltitude: null
  });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [airports, setAirports] = useState<string[]>([]);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.6892, 51.3890]); // تهران به صورت پیش‌فرض
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);

  // فانکشن فچ داده‌ها با مدیریت خطا
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/live-flights');
      
      if (!res.ok) {
        throw new Error(`خطا در دریافت اطلاعات: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setFlights(data);
      setLastUpdate(new Date());
      
      // استخراج لیست خطوط هوایی و فرودگاه‌ها برای فیلترها
      const uniqueAirlines = Array.from(new Set(data.map((flight: Flight) => flight.airline)));
      const uniqueAirports = Array.from(new Set([
        ...data.map((flight: Flight) => flight.origin),
        ...data.map((flight: Flight) => flight.destination)
      ]));
      
      setAirlines(uniqueAirlines as string[]);
      setAirports(uniqueAirports as string[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص در دریافت اطلاعات');
      console.error('Error fetching flight data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // اجرای اولیه و تنظیم اینتروال
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, fetchData]);

  // اعمال فیلترها روی پروازها
  useEffect(() => {
    let result = [...flights];
    
    // فیلتر فرودگاه
    if (airportFilter.origin) {
      result = result.filter(flight => flight.origin === airportFilter.origin);
    }
    
    if (airportFilter.destination) {
      result = result.filter(flight => flight.destination === airportFilter.destination);
    }
    
    // فیلتر پرواز
    if (flightFilter.airline) {
      result = result.filter(flight => flight.airline === flightFilter.airline);
    }
    
    if (flightFilter.status) {
      result = result.filter(flight => flight.status === flightFilter.status);
    }
    
    if (flightFilter.minAltitude !== null) {
      result = result.filter(flight => flight.altitude >= (flightFilter.minAltitude || 0));
    }
    
    if (flightFilter.maxAltitude !== null) {
      result = result.filter(flight => flight.altitude <= (flightFilter.maxAltitude || 99999));
    }
    
    setFilteredFlights(result);
  }, [flights, airportFilter, flightFilter]);

  // تنظیم مرکز نقشه بر اساس پرواز انتخابی
  useEffect(() => {
    if (selectedFlight) {
      setMapCenter([selectedFlight.latitude, selectedFlight.longitude]);
      setMapZoom(9); // بزرگنمایی بیشتر برای دیدن جزئیات
    }
  }, [selectedFlight]);

  // فانکشن های تغییر فیلتر فرودگاه
  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAirportFilter(prev => ({ ...prev, origin: e.target.value }));
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAirportFilter(prev => ({ ...prev, destination: e.target.value }));
  };

  // فانکشن های تغییر فیلتر پرواز
  const handleAirlineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFlightFilter(prev => ({ ...prev, airline: e.target.value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFlightFilter(prev => ({ ...prev, status: e.target.value }));
  };

  const handleAltitudeChange = (min: number | null, max: number | null) => {
    setFlightFilter(prev => ({ ...prev, minAltitude: min, maxAltitude: max }));
  };

  // تغییر بازه زمانی بروزرسانی
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRefreshInterval(parseInt(e.target.value));
  };

  // تغییر زوم نقشه
  const handleZoomChange = (zoom: number) => {
    setMapZoom(zoom);
  };

  // پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setAirportFilter({ origin: '', destination: '' });
    setFlightFilter({
      airline: '',
      status: '',
      minAltitude: null,
      maxAltitude: null
    });
  };

  // بروزرسانی دستی
  const handleManualRefresh = () => {
    fetchData();
  };

  // محاسبه آمار پروازها
  const flightStats = {
    total: filteredFlights.length,
    avgAltitude: filteredFlights.length > 0 
      ? Math.round(filteredFlights.reduce((sum, flight) => sum + flight.altitude, 0) / filteredFlights.length) 
      : 0,
    avgSpeed: filteredFlights.length > 0 
      ? Math.round(filteredFlights.reduce((sum, flight) => sum + flight.groundSpeed, 0) / filteredFlights.length) 
      : 0,
    byStatus: {
      inAir: filteredFlights.filter(f => f.status === 'In Air').length,
      landing: filteredFlights.filter(f => f.status === 'Landing').length,
      takeoff: filteredFlights.filter(f => f.status === 'Take Off').length,
      delayed: filteredFlights.filter(f => f.status === 'Delayed').length,
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">پروازهای زنده روی نقشه</h2>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdate 
              ? `آخرین بروزرسانی: ${lastUpdate.toLocaleTimeString('fa-IR')}` 
              : 'در حال دریافت اطلاعات...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ حالت روز' : '🌙 حالت شب'}
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${showStats ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? '🗺️ فقط نقشه' : '📊 نمایش آمار'}
          </button>
        </div>
      </div>

      {/* پنل کنترل و فیلتر */}
      <div className={`mb-6 p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* فیلتر فرودگاه‌ها */}
          <div>
            <h3 className="text-lg font-semibold mb-3">فیلتر فرودگاه‌ها</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">فرودگاه مبدا</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={airportFilter.origin}
                  onChange={handleOriginChange}
                >
                  <option value="">همه فرودگاه‌ها</option>
                  {airports.map(airport => (
                    <option key={airport} value={airport}>{airport}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">فرودگاه مقصد</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={airportFilter.destination}
                  onChange={handleDestinationChange}
                >
                  <option value="">همه فرودگاه‌ها</option>
                  {airports.map(airport => (
                    <option key={airport} value={airport}>{airport}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* فیلتر پروازها */}
          <div>
            <h3 className="text-lg font-semibold mb-3">فیلتر پروازها</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">خط هوایی</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={flightFilter.airline}
                  onChange={handleAirlineChange}
                >
                  <option value="">همه خطوط هوایی</option>
                  {airlines.map(airline => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">وضعیت</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={flightFilter.status}
                  onChange={handleStatusChange}
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="In Air">در حال پرواز</option>
                  <option value="Landing">در حال فرود</option>
                  <option value="Take Off">در حال برخاستن</option>
                  <option value="Delayed">تاخیری</option>
                </select>
              </div>
            </div>
          </div>

          {/* تنظیمات نقشه و بروزرسانی */}
          <div>
            <h3 className="text-lg font-semibold mb-3">تنظیمات نمایش</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">زمان بروزرسانی</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  value={refreshInterval}
                  onChange={handleIntervalChange}
                >
                  <option value="5000">هر 5 ثانیه</option>
                  <option value="10000">هر 10 ثانیه</option>
                  <option value="30000">هر 30 ثانیه</option>
                  <option value="60000">هر دقیقه</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className={`flex-1 px-3 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  onClick={handleManualRefresh}
                >
                  بروزرسانی دستی
                </button>
                <button
                  className={`flex-1 px-3 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={clearAllFilters}
                >
                  حذف فیلترها
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نمایش آمار (اختیاری) */}
      {showStats && (
        <div className={`mb-6 p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-3">آمار پروازهای جاری</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="text-sm text-gray-500">کل پروازها</div>
              <div className="text-xl font-bold">{flightStats.total}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="text-sm text-gray-500">در حال پرواز</div>
              <div className="text-xl font-bold text-green-600">{flightStats.byStatus.inAir}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="text-sm text-gray-500">میانگین ارتفاع</div>
              <div className="text-xl font-bold">{flightStats.avgAltitude} فوت</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <div className="text-sm text-gray-500">میانگین سرعت</div>
              <div className="text-xl font-bold">{flightStats.avgSpeed} ناتس</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className="text-sm text-gray-500">تاخیری</div>
              <div className="text-xl font-bold text-yellow-600">{flightStats.byStatus.delayed}</div>
            </div>
          </div>
        </div>
      )}

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold">خطا در دریافت اطلاعات</h3>
              <p>{error}</p>
            </div>
          </div>
          <button 
            className="mt-2 px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
            onClick={handleManualRefresh}
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* نمایش وضعیت بارگذاری */}
      {loading && !error && (
        <div className={`p-4 mb-4 rounded-lg text-sm flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-blue-50 text-blue-800'}`}>
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>در حال دریافت اطلاعات پروازها...</span>
        </div>
      )}

      {/* جدول پروازها */}
      <div className={`mb-6 p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold mb-3">جدول پروازها</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-500">
            <thead className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <tr>
                <th className="px-4 py-2">شماره پرواز</th>
                <th className="px-4 py-2">مبدا</th>
                <th className="px-4 py-2">مقصد</th>
                <th className="px-4 py-2">وضعیت</th>
                <th className="px-4 py-2">ارتفاع</th>
                <th className="px-4 py-2">سرعت</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map(flight => (
                <tr
                  key={flight.id}
                  className={`cursor-pointer hover:bg-blue-50 ${selectedFlight?.id === flight.id ? 'bg-blue-100 font-bold' : ''}`}
                  onClick={() => setSelectedFlight(flight)}
                >
                  <td className="px-4 py-2">{flight.flightNumber}</td>
                  <td className="px-4 py-2">{flight.origin}</td>
                  <td className="px-4 py-2">{flight.destination}</td>
                  <td className="px-4 py-2">{flight.status}</td>
                  <td className="px-4 py-2">{flight.altitude}</td>
                  <td className="px-4 py-2">{flight.groundSpeed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* کامپوننت نقشه */}
      <div className={`rounded-lg overflow-hidden shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-3 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium">نقشه زنده پروازها</h3>
            <p className="text-sm text-gray-500">نمایش {filteredFlights.length} پرواز</p>
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}
              onClick={() => handleZoomChange(Math.max(3, mapZoom - 1))}
            >
              -
            </button>
            <span className="px-2 py-1">{mapZoom}×</span>
            <button 
              className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}
              onClick={() => handleZoomChange(Math.min(12, mapZoom + 1))}
            >
              +
            </button>
          </div>
        </div>
        <div className="h-[70vh]">
          <FlightMapLive flights={filteredFlights} />
        </div>
      </div>

      {/* جزئیات پرواز انتخاب شده */}
      {selectedFlight && (
        <div className={`mt-4 p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold">اطلاعات پرواز {selectedFlight.flightNumber}</h3>
            <button 
              className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setSelectedFlight(null)}
            >
              بستن
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm text-gray-500 mb-1">اطلاعات پرواز</h4>
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">خط هوایی</div>
                    <div>{selectedFlight.airline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">هواپیما</div>
                    <div>{selectedFlight.aircraft}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">وضعیت</div>
                    <div 
                      className={
                        selectedFlight.status === 'In Air' ? 'text-green-500' :
                        selectedFlight.status === 'Delayed' ? 'text-yellow-500' :
                        selectedFlight.status === 'Landing' ? 'text-blue-500' : 
                        'text-gray-500'
                      }
                    >
                      {selectedFlight.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">پیشرفت مسیر</div>
                    <div className="flex items-center gap-1">
                      <div className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${selectedFlight.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{selectedFlight.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500 mb-1">مسیر</h4>
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">مبدا</div>
                    <div className="font-bold">{selectedFlight.origin}</div>
                    <div className="text-xs">
                      {new Date(selectedFlight.scheduledDeparture).toLocaleTimeString('fa-IR')}
                    </div>
                  </div>
                  <div className="flex-1 mx-2 border-t border-dashed border-gray-400 relative">
                    <div 
                      className="absolute w-3 h-3 bg-blue-500 rounded-full" 
                      style={{ 
                        left: `${selectedFlight.progress}%`, 
                        top: '-6px'
                      }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">مقصد</div>
                    <div className="font-bold">{selectedFlight.destination}</div>
                    <div className="text-xs">
                      {new Date(selectedFlight.estimatedArrival).toLocaleTimeString('fa-IR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500 mb-1">اطلاعات پروازی</h4>
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">ارتفاع</div>
                    <div>{selectedFlight.altitude.toLocaleString('fa-IR')} فوت</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">سرعت</div>
                    <div>{selectedFlight.groundSpeed.toLocaleString('fa-IR')} ناتس</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">مختصات</div>
                    <div className="text-sm">
                      {selectedFlight.latitude.toFixed(4)}, {selectedFlight.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">جهت</div>
                    <div className="flex items-center gap-1">
                      <span style={{ transform: `rotate(${selectedFlight.heading}deg)` }}>⬆️</span>
                      <span>{selectedFlight.heading}°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}