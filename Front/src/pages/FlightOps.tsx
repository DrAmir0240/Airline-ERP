import React, { useState, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Toast component instead of alert
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn z-50`}>
      <span className="text-lg">{icon}</span>
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">
        ×
      </button>
    </div>
  );
};

type Flight = {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  status: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  aircraft?: string;
  crew?: string[];
  passengers?: number;
  latitude?: number;
  longitude?: number;
  weather?: {
    metar?: string;
    taf?: string;
    conditions?: string;
    temperature?: number;
    visibility?: string;
  };
};

const mockFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'KA101',
    origin: 'THR',
    destination: 'MHD',
    status: 'Scheduled',
    scheduledDeparture: '2025-04-17T08:00:00',
    scheduledArrival: '2025-04-17T09:30:00',
    aircraft: 'Airbus A320',
    crew: ['کاپیتان محمدی', 'کمک خلبان علوی'],
    passengers: 132,
  },
  {
    id: '2',
    flightNumber: 'KA102',
    origin: 'MHD',
    destination: 'THR',
    status: 'Delayed',
    scheduledDeparture: '2025-04-17T10:00:00',
    scheduledArrival: '2025-04-17T11:30:00',
    aircraft: 'Boeing 737',
    crew: ['کاپیتان رضایی', 'کمک خلبان صفری'],
    passengers: 148,
  },
  {
    id: '3',
    flightNumber: 'KA103',
    origin: 'THR',
    destination: 'SYZ',
    status: 'In Progress',
    scheduledDeparture: '2025-04-17T07:30:00',
    scheduledArrival: '2025-04-17T09:00:00',
    aircraft: 'Airbus A319',
    crew: ['کاپیتان جعفری', 'کمک خلبان مهدوی'],
    passengers: 116,
  },
  {
    id: '4',
    flightNumber: 'KA104',
    origin: 'IFN',
    destination: 'THR',
    status: 'Scheduled',
    scheduledDeparture: '2025-04-17T15:00:00',
    scheduledArrival: '2025-04-17T16:15:00',
    aircraft: 'Airbus A320',
    crew: ['کاپیتان احمدی', 'کمک خلبان کریمی'],
    passengers: 138,
  },
  {
    id: '5',
    flightNumber: 'KA105',
    origin: 'THR',
    destination: 'AWZ',
    status: 'Cancelled',
    scheduledDeparture: '2025-04-17T11:30:00',
    scheduledArrival: '2025-04-17T13:00:00',
    aircraft: 'Boeing 737',
    crew: ['کاپیتان موسوی', 'کمک خلبان حسینی'],
    passengers: 124,
  },
];

const statusColors: { [key: string]: string } = {
  Scheduled: '#3b82f6',
  Delayed: '#f59e0b',
  Cancelled: '#ef4444',
  'In Progress': '#10b981',
};

const airportCodes: { [key: string]: string } = {
  THR: 'تهران (مهرآباد)',
  IKA: 'تهران (امام خمینی)',
  MHD: 'مشهد',
  SYZ: 'شیراز',
  IFN: 'اصفهان',
  AWZ: 'اهواز',
  TBZ: 'تبریز',
  BND: 'بندرعباس',
  KIH: 'کیش',
  ZAH: 'زاهدان',
  RAS: 'رشت',
};

export default function FlightOps() {
  const [filter, setFilter] = useState('');
  const [flights, setFlights] = useState(mockFlights);
  const [currentDay, setCurrentDay] = useState(new Date());
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<Flight | null>(null);
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [startHourFilter, setStartHourFilter] = useState<number | null>(null);
  const [endHourFilter, setEndHourFilter] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailViewMode, setDetailViewMode] = useState<'info' | 'weather' | 'crew'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // Advanced statistics
  const stats = useMemo(() => {
    return {
      total: flights.length,
      scheduled: flights.filter(f => f.status === 'Scheduled').length,
      inProgress: flights.filter(f => f.status === 'In Progress').length,
      delayed: flights.filter(f => f.status === 'Delayed').length,
      cancelled: flights.filter(f => f.status === 'Cancelled').length,
      totalPassengers: flights.reduce((sum, f) => sum + (f.passengers || 0), 0),
      averageFlightTime: flights.reduce((sum, f) => {
        const start = new Date(f.scheduledDeparture);
        const end = new Date(f.scheduledArrival);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
        return sum + diff;
      }, 0) / flights.length,
      mostPopularDestination: Object.entries(
        flights.reduce((acc, f) => {
          acc[f.destination] = (acc[f.destination] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
    };
  }, [flights]);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      setIsLoading(true);
      try {
        const updatedFlights = await Promise.all(flights.map(async flight => {
          try {
            // Simulating API calls with random data instead of real API
            const weather = {
              metar: `METAR ${flight.origin} ${new Date().toISOString().slice(0, 16)} AUTO 14008KT 9999 FEW040 24/14 Q1013 NOSIG`,
              taf: `TAF ${flight.origin} ${new Date().toISOString().slice(0, 16)} 14008KT 9999 FEW040 TX24/12Z TN14/23Z BECMG 0810 16012KT`,
              conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)],
              temperature: Math.floor(15 + Math.random() * 15),
              visibility: ['Good', 'Moderate', 'Poor'][Math.floor(Math.random() * 3)],
            };

            const lat = 30 + Math.random() * 10;
            const lng = 50 + Math.random() * 10;

            return {
              ...flight,
              weather,
              latitude: lat,
              longitude: lng,
            };
          } catch (err) {
            return flight;
          }
        }));
        setFlights(updatedFlights);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherAndLocation();
    const interval = setInterval(fetchWeatherAndLocation, 60000); // every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBarDrag = (id: string, deltaX: number) => {
    const deltaHours = deltaX / 60;

    setFlights((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newStart = new Date(new Date(f.scheduledDeparture).getTime() + deltaHours * 3600000);
          const newEnd = new Date(new Date(f.scheduledArrival).getTime() + deltaHours * 3600000);
          return {
            ...f,
            scheduledDeparture: newStart.toISOString(),
            scheduledArrival: newEnd.toISOString(),
          };
        }
        return f;
      })
    );
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (selectedFlight?.id !== id) {
      setSelectedFlight(flights.find(f => f.id === id) || null);
    }

    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      handleBarDrag(id, deltaX);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const updatedFlight = flights.find(f => f.id === id);
      if (updatedFlight) {
        // Simulating API success
        showToast('برنامه پرواز با موفقیت بروزرسانی شد', 'success');
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, direction: 'left' | 'right') => {
    e.stopPropagation();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaMs = (deltaX / 60) * 3600000;

      setFlights((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const newStart =
              direction === 'left'
                ? new Date(new Date(f.scheduledDeparture).getTime() + deltaMs)
                : new Date(f.scheduledDeparture);
            const newEnd =
              direction === 'right'
                ? new Date(new Date(f.scheduledArrival).getTime() + deltaMs)
                : new Date(f.scheduledArrival);

            if (newEnd > newStart) {
              return {
                ...f,
                scheduledDeparture: newStart.toISOString(),
                scheduledArrival: newEnd.toISOString(),
              };
            }
          }
          return f;
        })
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Simulating API success
      showToast('زمان‌بندی پرواز با موفقیت بروزرسانی شد', 'success');
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const filteredFlights = flights
    .filter(f =>
      f.flightNumber.toLowerCase().includes(filter.toLowerCase()) &&
      (!statusFilter || f.status === statusFilter) &&
      (!originFilter || f.origin.toLowerCase().includes(originFilter.toLowerCase())) &&
      (!destinationFilter || f.destination.toLowerCase().includes(destinationFilter.toLowerCase())) &&
      (startHourFilter === null || new Date(f.scheduledDeparture).getHours() >= startHourFilter) &&
      (endHourFilter === null || new Date(f.scheduledDeparture).getHours() <= endHourFilter) &&
      new Date(f.scheduledDeparture).toDateString() === currentDay.toDateString()
    );

  const exportToExcel = () => {
    const data = flights.map(f => ({
      'Flight Number': f.flightNumber,
      'Origin': airportCodes[f.origin] || f.origin,
      'Destination': airportCodes[f.destination] || f.destination,
      'Status': f.status,
      'Departure': new Date(f.scheduledDeparture).toLocaleString(),
      'Arrival': new Date(f.scheduledArrival).toLocaleString(),
      'Aircraft': f.aircraft,
      'Passengers': f.passengers,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Flights');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `flights-${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('گزارش اکسل با موفقیت دانلود شد', 'success');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica");
    doc.setFontSize(18);
    doc.text('گزارش پروازها', 14, 22);

    doc.setFontSize(12);
    doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, 14, 32);
    doc.text(`تعداد کل: ${flights.length}`, 14, 40);

    doc.autoTable({
      startY: 50,
      head: [['شماره پرواز', 'مبدا', 'مقصد', 'وضعیت', 'زمان خروج', 'زمان ورود']],
      body: flights.map(f => [
        f.flightNumber,
        airportCodes[f.origin] || f.origin,
        airportCodes[f.destination] || f.destination,
        f.status,
        new Date(f.scheduledDeparture).toLocaleString('fa-IR'),
        new Date(f.scheduledArrival).toLocaleString('fa-IR')
      ]),
      styles: {
        font: 'Helvetica',
        fontStyle: 'normal',
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: [240, 244, 248],
      }
    });

    doc.save(`flights-${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('گزارش PDF با موفقیت دانلود شد', 'success');
  };

  // Date navigation functions
  const goToNextDay = () => {
    const next = new Date(currentDay);
    next.setDate(next.getDate() + 1);
    setCurrentDay(next);
  };

  const goToPrevDay = () => {
    const prev = new Date(currentDay);
    prev.setDate(prev.getDate() - 1);
    setCurrentDay(prev);
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">مدیریت پروازها</h2>
          <p className="text-sm text-gray-500 mt-1">
            نمایش و مدیریت برنامه پروازهای روزانه
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
            className={`px-3 py-1.5 rounded-md text-sm ${mapView ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
            onClick={() => setMapView(!mapView)}
          >
            {mapView ? '📋 جدول' : '🗺️ نقشه'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-3">آمار پروازها</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="text-sm text-gray-500">کل پروازها</div>
              <div className="text-xl font-bold">{stats.total}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="text-sm text-gray-500">در حال انجام</div>
              <div className="text-xl font-bold text-green-600">{stats.inProgress}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className="text-sm text-gray-500">تاخیری</div>
              <div className="text-xl font-bold text-yellow-600">{stats.delayed}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <div className="text-sm text-gray-500">لغو شده</div>
              <div className="text-xl font-bold text-red-600">{stats.cancelled}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="text-sm text-gray-500">کل مسافران</div>
              <div className="text-xl font-bold">{stats.totalPassengers}</div>
            </div>
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <div className="text-sm text-gray-500">میانگین زمان</div>
              <div className="text-xl font-bold">{Math.round(stats.averageFlightTime)} دقیقه</div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-3">انتخاب تاریخ</h3>
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={goToPrevDay}
              className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              &lt;
            </button>
            <div className="text-lg font-medium">
              {currentDay.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <button
              onClick={goToNextDay}
              className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`px-3 py-2 rounded text-center ${currentDay.toDateString() === new Date().toDateString() ? 'bg-blue-500 text-white' : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
              onClick={() => setCurrentDay(new Date())}
            >
              امروز
            </button>
            <button
              className={`px-3 py-2 rounded text-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => {
                const tmr = new Date();
                tmr.setDate(tmr.getDate() + 1);
                setCurrentDay(tmr);
              }}
            >
              فردا
            </button>
            <button
              className={`px-3 py-2 rounded text-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => {
                const datm = new Date();
                datm.setDate(datm.getDate() + 2);
                setCurrentDay(datm);
              }}
            >
              پس‌فردا
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-3">جستجو و فیلتر</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                className={`border px-3 py-2 rounded w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                type="text"
                placeholder="جستجو بر اساس شماره پرواز"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <select
                className={`border px-3 py-2 rounded w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="Scheduled">برنامه‌ریزی شده</option>
                <option value="In Progress">در حال انجام</option>
                <option value="Delayed">تاخیری</option>
                <option value="Cancelled">لغو شده</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                className={`border px-3 py-2 rounded w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
              >
                <option value="">همه مبداها</option>
                {Object.entries(airportCodes).map(([code, name]) => (
                  <option key={code} value={code}>{name} ({code})</option>
                ))}
              </select>
              <select
                className={`border px-3 py-2 rounded w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
              >
                <option value="">همه مقصدها</option>
                {Object.entries(airportCodes).map(([code, name]) => (
                  <option key={code} value={code}>{name} ({code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
          onClick={() => setShowAddForm(true)}
        >
          <span>➕</span>
          <span>افزودن پرواز جدید</span>
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          onClick={exportToExcel}
        >
          <span>📊</span>
          <span>خروجی اکسل</span>
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
          onClick={exportToPDF}
        >
          <span>📄</span>
          <span>خروجی PDF</span>
        </button>
        {isLoading && (
          <div className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>در حال بروزرسانی اطلاعات...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className={`mb-6 overflow-hidden rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold border-b p-4">وضعیت پروازها</h3>
            <div className="p-4 space-y-2">
              {['Scheduled', 'In Progress', 'Delayed', 'Cancelled'].map((status) => {
                const count = flights.filter(f => f.status === status).length;
                const statusLabel = {
                  'Scheduled': 'برنامه‌ریزی شده',
                  'In Progress': 'در حال انجام',
                  'Delayed': 'تاخیری',
                  'Cancelled': 'لغو شده'
                }[status];

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-32 text-sm">{statusLabel}</div>
                    <div className={`flex-1 bg-gray-200 dark:bg-gray-700 h-5 rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${count === 0 ? 0 : Math.max(5, (count / flights.length) * 100)}%`,
                          backgroundColor: statusColors[status] || '#9ca3af',
                        }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`overflow-x-auto mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            {!mapView ? (
              <div className="relative p-4">
                <div className="flex text-xs text-gray-500 border-b pb-2 mb-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-[60px] text-center">{i}:00</div>
                  ))}
                </div>

                {filteredFlights.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>هیچ پروازی با شرایط انتخابی یافت نشد.</p>
                    <button
                      className="mt-2 text-blue-500 underline"
                      onClick={() => {
                        setFilter('');
                        setStatusFilter('');
                        setOriginFilter('');
                        setDestinationFilter('');
                        setStartHourFilter(null);
                        setEndHourFilter(null);
                      }}
                    >
                      پاک کردن فیلترها
                    </button>
                  </div>
                ) : (
                  filteredFlights.map((flight) => {
                    const start = new Date(flight.scheduledDeparture);
                    const end = new Date(flight.scheduledArrival);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;
                    const left = startHour * 60;
                    const width = Math.max(30, (endHour - startHour) * 60); // Ensure minimum width

                    return (
                      <div key={flight.id} className="relative mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <div className="font-medium">{flight.flightNumber}</div>
                          <div className={`px-2 py-0.5 rounded-full text-xs ${flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            flight.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                              flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {
                              flight.status === 'Scheduled' ? 'Scheduled' :
                                flight.status === 'In Progress' ? 'In Progress' :
                                  flight.status === 'Delayed' ? 'Delayed' : 'Cancelled'
                            }
                          </div>
                        </div>
                        <div className={`relative h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                          <div
                            className={`absolute top-0 left-0 h-10 rounded-lg text-white text-xs flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-300 ${flight.status === 'Cancelled' ? 'opacity-50' : ''
                              }`}
                            style={{
                              backgroundColor: statusColors[flight.status] || '#6b7280',
                              width: `${width}px`,
                              left: `${left}px`,
                            }}
                            title={`پرواز: ${flight.flightNumber}\nمسیر: ${airportCodes[flight.origin] || flight.origin} → ${airportCodes[flight.destination] || flight.destination}\nوضعیت: ${flight.status}\nخروج: ${start.toLocaleTimeString()}\nورود: ${end.toLocaleTimeString()}`}
                            onMouseDown={(e) => handleDragStart(e, flight.id)}
                          >
                            {/* Resize handles */}
                            <div
                              className="absolute left-0 top-0 h-full w-3 bg-black/30 cursor-ew-resize rounded-l-lg"
                              onMouseDown={(e) => handleResizeStart(e, flight.id, 'left')}
                            />
                            <div
                              className="absolute right-0 top-0 h-full w-3 bg-black/30 cursor-ew-resize rounded-r-lg"
                              onMouseDown={(e) => handleResizeStart(e, flight.id, 'right')}
                            />

                            <div className="flex items-center gap-2 px-3 truncate">
                              <span className="truncate">
                                {airportCodes[flight.origin] || flight.origin} → {airportCodes[flight.destination] || flight.destination}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded">
                                {flight.passengers} مسافر
                              </span>
                            </div>

                            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-1">
                              <button
                                onClick={() => {
                                  const confirmDelete = window.confirm(`آیا از حذف پرواز ${flight.flightNumber} اطمینان دارید؟`);
                                  if (confirmDelete) {
                                    setLastDeleted(flight);
                                    setFlights(flights.filter(f => f.id !== flight.id));
                                    showToast('پرواز با موفقیت حذف شد', 'success');
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                  {mapView && (
                    <div className={`p-8 text-center flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 500 300"
                        className="w-full max-w-2xl mx-auto mb-6 opacity-70"
                      >
                        {/* Background */}
                        <rect x="0" y="0" width="500" height="300" fill={darkMode ? '#1f2937' : '#f0f9ff'} />

                        {/* Flight path */}
                        <path
                          d="M50 250 Q250 50 450 250"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeDasharray="10 10"
                        />

                        {/* Flight markers */}
                        {flights.map((flight, index) => (
                          <g key={flight.id}>
                            <circle
                              cx={50 + index * 150}
                              cy={100 + index * 20}
                              r="10"
                              fill={statusColors[flight.status] || '#6b7280'}
                            />
                            <text
                              x={50 + index * 150}
                              y={100 + index * 20 + 25}
                              textAnchor="middle"
                              fontSize="10"
                              fill={darkMode ? '#ffffff' : '#000000'}
                            >
                              {flight.flightNumber}
                            </text>
                          </g>
                        ))}

                        {/* Title */}
                        <text
                          x="250"
                          y="50"
                          textAnchor="middle"
                          className={`text-xl font-bold ${darkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
                        >
                          نقشه پروازها
                        </text>

                        {/* Subtitle */}
                        <text
                          x="250"
                          y="280"
                          textAnchor="middle"
                          className={`text-sm ${darkMode ? 'fill-gray-400' : 'fill-gray-500'}`}
                        >
                          به زودی امکان نمایش پروازها روی نقشه فعال خواهد شد
                        </text>
                      </svg>

                      <div className="max-w-md mx-auto text-center">
                        <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          نمایش پروازها روی نقشه
                        </h3>

                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          به زودی قابلیت نمایش موقعیت دقیق پروازها، مسیرها و اطلاعات زنده در دسترس خواهد بود.
                        </p>

                        <div className="flex justify-center items-center gap-4">
                          <button
                            onClick={() => setMapView(false)}
                            className={`px-4 py-2 rounded transition-all duration-300 flex items-center justify-center gap-2 ${darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>
                            بازگشت به نمای جدول
                          </button>

                          <button
                            className={`px-4 py-2 rounded transition-all duration-300 flex items-center justify-center gap-2 ${darkMode
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.618V7.382a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              />
                            </svg>
                            اطلاعات بیشتر
                          </button>
                        </div>

                        {/* Flight Summary */}
                        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>کل پروازها</div>
                              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{flights.length}</div>
                            </div>
                            <div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>در حال پرواز</div>
                              <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {flights.filter(f => f.status === 'In Progress').length}
                              </div>
                            </div>
                            <div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>تاخیری</div>
                              <div className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                {flights.filter(f => f.status === 'Delayed').length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>


      </div>
      <aside className={`w-full md:w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Flight Details</h3>
          <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              className={`px-3 py-1.5 text-sm ${detailViewMode === 'info' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
              onClick={() => setDetailViewMode('info')}
            >
              Information
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${detailViewMode === 'weather' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
              onClick={() => setDetailViewMode('weather')}
            >
              Weather
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${detailViewMode === 'crew' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
              onClick={() => setDetailViewMode('crew')}
            >
              Crew
            </button>
          </div>
        </div>

        {!selectedFlight ? (
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center justify-center text-center`}>
            <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <p className="mb-2">برای مشاهده جزئیات، یک پرواز را انتخاب کنید</p>
            <p className="text-xs text-gray-500">روی نوار زمانی پرواز کلیک کنید</p>
          </div>
        ) : (
          <div className="space-y-4">
            {detailViewMode === 'info' && (
              <>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">شماره پرواز</div>
                      <input
                        className={`mt-1 block w-full border rounded px-3 py-1.5 text-lg font-bold ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        value={selectedFlight.flightNumber}
                        onChange={(e) => setSelectedFlight({ ...selectedFlight, flightNumber: e.target.value })}
                      />
                    </div>
                    <select
                      className={`mt-1 border rounded px-3 py-1.5 ${selectedFlight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        selectedFlight.status === 'In Progress' ? 'bg-green-100 text-green-800 border-green-200' :
                          selectedFlight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-red-100 text-red-800 border-red-200'
                        }`}
                      value={selectedFlight.status}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, status: e.target.value })}
                    >
                      <option value="Scheduled">برنامه‌ریزی شده</option>
                      <option value="In Progress">در حال انجام</option>
                      <option value="Delayed">تاخیری</option>
                      <option value="Cancelled">لغو شده</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">مبدا</div>
                    <select
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.origin}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, origin: e.target.value })}
                    >
                      {Object.entries(airportCodes).map(([code, name]) => (
                        <option key={code} value={code}>{name} ({code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">مقصد</div>
                    <select
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.destination}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, destination: e.target.value })}
                    >
                      {Object.entries(airportCodes).map(([code, name]) => (
                        <option key={code} value={code}>{name} ({code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">زمان حرکت</div>
                    <input
                      type="datetime-local"
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.scheduledDeparture.slice(0, 16)}
                      onChange={(e) => setSelectedFlight({
                        ...selectedFlight,
                        scheduledDeparture: new Date(e.target.value).toISOString()
                      })}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">زمان رسیدن</div>
                    <input
                      type="datetime-local"
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.scheduledArrival.slice(0, 16)}
                      onChange={(e) => setSelectedFlight({
                        ...selectedFlight,
                        scheduledArrival: new Date(e.target.value).toISOString()
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">نوع هواپیما</div>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.aircraft || ''}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, aircraft: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">تعداد مسافران</div>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      className={`w-full border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      value={selectedFlight.passengers || 0}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, passengers: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}

            {detailViewMode === 'weather' && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">شرایط آب و هوای مبدا ({selectedFlight.origin})</div>
                  <div className="flex items-center mb-3">
                    <div className="text-4xl mr-3">
                      {selectedFlight.weather?.conditions === 'Clear' ? '☀️' :
                        selectedFlight.weather?.conditions === 'Partly Cloudy' ? '⛅' :
                          selectedFlight.weather?.conditions === 'Cloudy' ? '☁️' :
                            selectedFlight.weather?.conditions === 'Rain' ? '🌧️' : '⚡'}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{selectedFlight.weather?.temperature || 25}°C</div>
                      <div className="text-sm">{selectedFlight.weather?.conditions || 'Clear'}</div>
                      <div className="text-sm text-gray-500">Visibility: {selectedFlight.weather?.visibility || 'Good'}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">METAR</div>
                  <div className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} text-xs font-mono overflow-x-auto whitespace-pre-wrap`}>
                    {selectedFlight.weather?.metar || 'METAR data unavailable'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">TAF</div>
                  <div className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} text-xs font-mono overflow-x-auto whitespace-pre-wrap`}>
                    {selectedFlight.weather?.taf || 'TAF data unavailable'}
                  </div>
                </div>
              </div>
            )}

            {detailViewMode === 'crew' && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">خدمه پرواز</div>
                  <ul className="space-y-2">
                    {selectedFlight.crew?.map((member, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{member}</span>
                        <button
                          onClick={() => {
                            const newCrew = [...(selectedFlight.crew || [])];
                            newCrew.splice(index, 1);
                            setSelectedFlight({ ...selectedFlight, crew: newCrew });
                          }}
                          className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700'}`}
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="افزودن خدمه جدید"
                      className={`flex-1 border rounded px-3 py-1.5 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      id="new-crew-member"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('new-crew-member') as HTMLInputElement;
                        if (input.value) {
                          setSelectedFlight({
                            ...selectedFlight,
                            crew: [...(selectedFlight.crew || []), input.value]
                          });
                          input.value = '';
                        }
                      }}
                      className={`px-3 py-1.5 rounded ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
                    >
                      افزودن
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => {
                  // Reset selection
                  setSelectedFlight(null);
                }}
              >
                انصراف
              </button>
              <button
                className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                onClick={() => {
                  if (selectedFlight) {
                    // Update flight in the flights array
                    setFlights(flights.map(f =>
                      f.id === selectedFlight.id ? selectedFlight : f
                    ));
                    showToast('اطلاعات پرواز با موفقیت بروزرسانی شد', 'success');
                  }
                }}
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        )}
      </aside>
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[90%] max-w-lg space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">افزودن پرواز جدید</h3>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newFlight: Flight = {
                  id: Date.now().toString(),
                  flightNumber: (form.flightNumber as HTMLInputElement).value,
                  origin: (form.origin as HTMLSelectElement).value,
                  destination: (form.destination as HTMLSelectElement).value,
                  status: (form.status as HTMLSelectElement).value,
                  scheduledDeparture: (form.departure as HTMLInputElement).value,
                  scheduledArrival: (form.arrival as HTMLInputElement).value,
                  aircraft: (form.aircraft as HTMLInputElement).value,
                  passengers: Number((form.passengers as HTMLInputElement).value),
                };
                setFlights([...flights, newFlight]);
                setShowAddForm(false);
                showToast('پرواز جدید با موفقیت افزوده شد', 'success');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">شماره پرواز</label>
                  <input
                    name="flightNumber"
                    required
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="مانند KA106"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">وضعیت</label>
                  <select
                    name="status"
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="Scheduled">برنامه‌ریزی شده</option>
                    <option value="In Progress">در حال انجام</option>
                    <option value="Delayed">تاخیری</option>
                    <option value="Cancelled">لغو شده</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">مبدا</label>
                  <select
                    name="origin"
                    required
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {Object.entries(airportCodes).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">مقصد</label>
                  <select
                    name="destination"
                    required
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {Object.entries(airportCodes).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">زمان حرکت</label>
                  <input
                    name="departure"
                    type="datetime-local"
                    required
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">زمان رسیدن</label>
                  <input
                    name="arrival"
                    type="datetime-local"
                    required
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    defaultValue={new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">نوع هواپیما</label>
                  <input
                    name="aircraft"
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="مانند Airbus A320"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">تعداد مسافران</label>
                  <input
                    name="passengers"
                    type="number"
                    min="0"
                    className={`w-full border rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="120"
                    defaultValue="120"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >


                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lastDeleted && (
        <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 animate-fadeIn z-40">
          <span>پرواز {lastDeleted.flightNumber} حذف شد</span>
          <button
            onClick={() => {
              setFlights([...flights, lastDeleted]);
              setLastDeleted(null);
              showToast('پرواز بازگردانی شد', 'success');
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
          >
            بازگردانی
          </button>
          <button onClick={() => setLastDeleted(null)} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}