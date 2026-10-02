import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define the Airport interface based on the SQL table structure
interface Airport {
    id: string;
    iata_code: string;
    icao_code?: string;
    name: string;
    city?: string;
    country?: string;
    timezone?: string;
    elevation_meters?: number;
    latitude?: number;
    longitude?: number;
}

export default function Airports() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [airports, setAirports] = useState<Airport[]>([
        {
            id: '123e4567-e89b-12d3-a456-426614174000',
            iata_code: 'IKA',
            icao_code: 'OIIE',
            name: 'فرودگاه بین‌المللی امام خمینی',
            city: 'تهران',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 1007,
            latitude: 35.416111,
            longitude: 51.152222
        },
        {
            id: '223e4567-e89b-12d3-a456-426614174001',
            iata_code: 'THR',
            icao_code: 'OIII',
            name: 'فرودگاه بین‌المللی مهرآباد',
            city: 'تهران',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 1200,
            latitude: 35.689167,
            longitude: 51.313611
        },
        {
            id: '323e4567-e89b-12d3-a456-426614174002',
            iata_code: 'MHD',
            icao_code: 'OIMM',
            name: 'فرودگاه بین‌المللی شهید هاشمی‌نژاد',
            city: 'مشهد',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 995,
            latitude: 36.234167,
            longitude: 59.643056
        },
        {
            id: '423e4567-e89b-12d3-a456-426614174003',
            iata_code: 'SYZ',
            icao_code: 'OISS',
            name: 'فرودگاه بین‌المللی شهید دستغیب',
            city: 'شیراز',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 1488,
            latitude: 29.539167,
            longitude: 52.589722
        },
        {
            id: '523e4567-e89b-12d3-a456-426614174004',
            iata_code: 'ISF',
            icao_code: 'OIFM',
            name: 'فرودگاه بین‌المللی شهید بهشتی',
            city: 'اصفهان',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 1542,
            latitude: 32.750836,
            longitude: 51.861667
        },
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newAirport, setNewAirport] = useState<Partial<Airport>>({
        iata_code: '',
        icao_code: '',
        name: '',
        city: '',
        country: 'ایران',
        timezone: 'Asia/Tehran',
        elevation_meters: 0,
        latitude: 0,
        longitude: 0
    });

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(airports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Airports');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'airports_data.xlsx');
        toast.success('فایل با موفقیت دانلود شد');
    };

    // Filter airports based on search term
    const filteredAirports = airports.filter(airport =>
        airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.iata_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (airport.city && airport.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (airport.country && airport.country.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handle airport selection
    const handleSelectAirport = (airport: Airport) => {
        setSelectedAirport(airport);
    };

    // Close detail view
    const handleCloseDetail = () => {
        setSelectedAirport(null);
    };

    // Handle adding a new airport
    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        // Reset the form data
        setNewAirport({
            iata_code: '',
            icao_code: '',
            name: '',
            city: '',
            country: 'ایران',
            timezone: 'Asia/Tehran',
            elevation_meters: 0,
            latitude: 0,
            longitude: 0
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAirport(prev => ({
            ...prev,
            [name]: name === 'elevation_meters' || name === 'latitude' || name === 'longitude'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleAddAirport = () => {
        // Validate inputs
        if (!newAirport.iata_code || !newAirport.name) {
            toast.error('لطفاً فیلدهای ضروری را تکمیل کنید');
            return;
        }

        // Create new airport with UUID
        const airport: Airport = {
            id: crypto.randomUUID(), // Generate a UUID
            iata_code: newAirport.iata_code,
            icao_code: newAirport.icao_code,
            name: newAirport.name,
            city: newAirport.city,
            country: newAirport.country,
            timezone: newAirport.timezone,
            elevation_meters: newAirport.elevation_meters,
            latitude: newAirport.latitude,
            longitude: newAirport.longitude
        };

        // Add to airports list
        setAirports(prev => [airport, ...prev]);

        // Close modal and show success message
        handleCloseAddModal();
        toast.success('فرودگاه جدید با موفقیت اضافه شد');
    };

    // داده‌های نمونه برای فرودگاه‌ها
    const airportStats = {
        total: 52,
        international: 8,
        domestic: 44,
        activeRunways: 67,
        recentActivity: [
            { id: 1, flight: 'IR721', from: 'تهران (IKA)', to: 'استانبول (IST)', date: '1402/01/25', status: 'completed' },
            { id: 2, flight: 'W5112', from: 'مشهد (MHD)', to: 'دبی (DXB)', date: '1402/01/24', status: 'completed' },
            { id: 3, flight: 'EP412', from: 'شیراز (SYZ)', to: 'تهران (THR)', date: '1402/01/24', status: 'delayed' },
            { id: 4, flight: 'IR655', from: 'اصفهان (ISF)', to: 'تهران (IKA)', date: '1402/01/23', status: 'completed' },
            { id: 5, flight: 'W5082', from: 'تهران (IKA)', to: 'فرانکفورت (FRA)', date: '1402/01/23', status: 'scheduled' },
        ],
        upcomingMaintenance: [
            { id: 1, title: 'بازسازی باند اصلی', airport: 'مهرآباد (THR)', date: '1402/02/05' },
            { id: 2, title: 'تعمیر سیستم روشنایی', airport: 'شیراز (SYZ)', date: '1402/02/10' },
            { id: 3, title: 'بازرسی سیستم رادار', airport: 'امام خمینی (IKA)', date: '1402/02/15' },
        ],
        facilities: {
            operational: 48,
            underMaintenance: 3,
            plannedExpansion: 4
        }
    };

    // داده‌های نمونه برای نمودار پروازها
    const flightsData = [
        { month: 'فروردین', international: 350, domestic: 720 },
        { month: 'اردیبهشت', international: 380, domestic: 680 },
        { month: 'خرداد', international: 410, domestic: 710 },
        { month: 'تیر', international: 520, domestic: 890 },
        { month: 'مرداد', international: 540, domestic: 920 },
        { month: 'شهریور', international: 480, domestic: 780 },
    ];

    // Utility function for status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">انجام شده</span>;
            case 'delayed':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">تاخیر</span>;
            case 'scheduled':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">برنامه‌ریزی شده</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">مدیریت فرودگاه‌ها</h1>
                        <p className="mt-2 text-gray-600">سیستم مدیریت، پایش و نظارت بر فرودگاه‌های کشور</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            افزودن فرودگاه
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow flex items-center gap-2 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            خروجی اکسل
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">کل فرودگاه‌ها</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{airportStats.total}</h4>
                                <p className="mt-1 text-sm text-gray-500">فرودگاه</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6.4M15 15v-3m0 0l-3 3m3-3l3 3"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">فرودگاه‌های بین‌المللی</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{airportStats.international}</h4>
                                <p className="mt-1 text-sm text-gray-500">فرودگاه ({Math.round((airportStats.international / airportStats.total) * 100)}%)</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">فرودگاه‌های داخلی</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{airportStats.domestic}</h4>
                                <p className="mt-1 text-sm text-gray-500">فرودگاه ({Math.round((airportStats.domestic / airportStats.total) * 100)}%)</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">باندهای فعال</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{airportStats.activeRunways}</h4>
                                <p className="mt-1 text-sm text-gray-500">باند</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="جستجو بر اساس نام، کد، شهر یا کشور..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Airports Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">فهرست فرودگاه‌ها</h3>
                            <div className="flex items-center">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    مشاهده همه
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-4">در حال بارگذاری اطلاعات فرودگاه‌ها...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد IATA</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد ICAO</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام فرودگاه</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شهر</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کشور</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAirports.length > 0 ? (
                                            filteredAirports.map((airport) => (
                                                <tr key={airport.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{airport.iata_code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.icao_code || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.city || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.country || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => handleSelectAirport(airport)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                                        >
                                                            مشاهده جزئیات
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    هیچ فرودگاهی با معیارهای جستجوی شما یافت نشد.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Flights Chart */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">آمار پروازها</h3>
                            <div className="inline-flex shadow-sm rounded-md">
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium ${selectedPeriod === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} rounded-r-md border border-gray-200 hover:bg-gray-50`}
                                    onClick={() => setSelectedPeriod('week')}
                                >
                                    هفته
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium ${selectedPeriod === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} border-t border-b border-gray-200 hover:bg-gray-50`}
                                    onClick={() => setSelectedPeriod('month')}
                                >
                                    ماه
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium ${selectedPeriod === 'year' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} rounded-l-md border border-gray-200 hover:bg-gray-50`}
                                    onClick={() => setSelectedPeriod('year')}
                                >
                                    سال
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={flightsData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="international" name="پروازهای بین‌المللی" fill="#60A5FA" />
                                <Bar dataKey="domestic" name="پروازهای داخلی" fill="#F87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Facility Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">وضعیت تأسیسات</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">در حال فعالیت</span>
                                    <span className="text-sm font-medium text-green-600">{airportStats.facilities.operational} فرودگاه</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${(airportStats.facilities.operational / airportStats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">در حال تعمیر</span>
                                    <span className="text-sm font-medium text-yellow-600">{airportStats.facilities.underMaintenance} فرودگاه</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(airportStats.facilities.underMaintenance / airportStats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">در حال توسعه</span>
                                    <span className="text-sm font-medium text-blue-600">{airportStats.facilities.plannedExpansion} فرودگاه</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(airportStats.facilities.plannedExpansion / airportStats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مشاهده جزئیات تأسیسات
                        </button>
                    </div>

                    {/* Recent Flight Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">آخرین پروازها</h3>
                        <div className="space-y-4">
                            {airportStats.recentActivity.map((activity) => (
                                <div key={activity.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-900">{activity.flight}</h4>
                                        {getStatusBadge(activity.status)}
                                    </div>
                                    <div className="mt-2 flex justify-between text-sm">
                                        <span className="text-gray-600">{activity.from} → {activity.to}</span>
                                        <span className="text-gray-500">{activity.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مشاهده همه پروازها
                        </button>
                    </div>

                    {/* Upcoming Maintenance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تعمیرات پیش رو</h3>
                        <div className="space-y-4">
                            {airportStats.upcomingMaintenance.map((maintenance) => (
                                <div key={maintenance.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <h4 className="font-medium text-gray-900">{maintenance.title}</h4>
                                    <div className="mt-2 flex justify-between text-sm">
                                        <span className="text-gray-600">{maintenance.airport}</span>
                                        <span className="text-blue-600">{maintenance.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مدیریت تعمیرات
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">دسترسی سریع</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">برنامه پروازها</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">مجوزها</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">زمان‌های پرواز</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">تقویم تعمیرات</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Airport Detail Modal */}
            {selectedAirport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedAirport.name}</h2>
                            <button
                                onClick={handleCloseDetail}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="mb-2"><span className="font-semibold">کد IATA:</span> {selectedAirport.iata_code}</p>
                                <p className="mb-2"><span className="font-semibold">کد ICAO:</span> {selectedAirport.icao_code || 'تعیین نشده'}</p>
                                <p className="mb-2"><span className="font-semibold">شهر:</span> {selectedAirport.city || 'تعیین نشده'}</p>
                                <p className="mb-2"><span className="font-semibold">کشور:</span> {selectedAirport.country || 'تعیین نشده'}</p>
                            </div>
                            <div>
                                <p className="mb-2"><span className="font-semibold">منطقه زمانی:</span> {selectedAirport.timezone || 'تعیین نشده'}</p>
                                <p className="mb-2"><span className="font-semibold">ارتفاع:</span> {selectedAirport.elevation_meters !== undefined ? `${selectedAirport.elevation_meters} متر` : 'تعیین نشده'}</p>
                                <p className="mb-2"><span className="font-semibold">عرض جغرافیایی:</span> {selectedAirport.latitude || 'تعیین نشده'}</p>
                                <p className="mb-2"><span className="font-semibold">طول جغرافیایی:</span> {selectedAirport.longitude || 'تعیین نشده'}</p>
                            </div>
                        </div>

                        {selectedAirport.latitude && selectedAirport.longitude && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">موقعیت جغرافیایی</h3>
                                <div className="bg-gray-200 p-4 rounded text-center h-48 flex items-center justify-center">
                                    <div className="text-gray-700">نمایش نقشه در محیط تولید قابل دسترس خواهد بود</div>
                                </div>
                            </div>
                        )}

                        {/* Additional Airport information */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">اطلاعات تکمیلی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-blue-700 font-medium mb-1">تعداد پروازها (ماهانه)</div>
                                    <div className="text-2xl font-bold text-blue-800">265</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-green-700 font-medium mb-1">تعداد باند‌های فعال</div>
                                    <div className="text-2xl font-bold text-green-800">2</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-purple-700 font-medium mb-1">ظرفیت (مسافر/روز)</div>
                                    <div className="text-2xl font-bold text-purple-800">10,500</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                            >
                                بستن
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                ویرایش اطلاعات
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Airport Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">افزودن فرودگاه جدید</h2>
                            <button
                                onClick={handleCloseAddModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="iata_code">
                                    کد IATA <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="iata_code"
                                    name="iata_code"
                                    type="text"
                                    placeholder="مثال: THR"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.iata_code}
                                    onChange={handleInputChange}
                                    maxLength={3}
                                />
                                <p className="text-xs text-gray-500 mt-1">کد سه حرفی IATA</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icao_code">
                                    کد ICAO
                                </label>
                                <input
                                    id="icao_code"
                                    name="icao_code"
                                    type="text"
                                    placeholder="مثال: OIII"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.icao_code}
                                    onChange={handleInputChange}
                                    maxLength={4}
                                />
                                <p className="text-xs text-gray-500 mt-1">کد چهار حرفی ICAO</p>
                            </div>

                            <div className="mb-4 md:col-span-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    نام فرودگاه <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="مثال: فرودگاه بین‌المللی مهرآباد"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                                    شهر
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    placeholder="مثال: تهران"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.city}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                                    کشور
                                </label>
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    placeholder="مثال: ایران"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.country}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timezone">
                                    منطقه زمانی
                                </label>
                                <input
                                    id="timezone"
                                    name="timezone"
                                    type="text"
                                    placeholder="مثال: Asia/Tehran"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.timezone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="elevation_meters">
                                    ارتفاع (متر)
                                </label>
                                <input
                                    id="elevation_meters"
                                    name="elevation_meters"
                                    type="number"
                                    placeholder="مثال: 1200"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.elevation_meters}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
                                    عرض جغرافیایی
                                </label>
                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="مثال: 35.689167"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.latitude}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
                                    طول جغرافیایی
                                </label>
                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="مثال: 51.313611"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAirport.longitude}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={handleCloseAddModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleAddAirport}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                ذخیره
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl />
        </div>
    );
}