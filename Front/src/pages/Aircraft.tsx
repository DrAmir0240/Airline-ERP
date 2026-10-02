import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Define the Aircraft interface
interface Aircraft {
    id: string;
    model: string;
    status: string;
    capacity: number;
    lastMaintenance: string;
}

export default function Aircraft() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [aircraftList, setAircraftList] = useState<Aircraft[]>([
        { id: 'EP-A320', model: 'ایرباس A320', status: 'Active', capacity: 180, lastMaintenance: '2025-03-10' },
        { id: 'EP-B737', model: 'بوئینگ 737', status: 'Under Maintenance', capacity: 160, lastMaintenance: '2025-04-01' },
        { id: 'EP-A321', model: 'ایرباس A321', status: 'Active', capacity: 200, lastMaintenance: '2025-02-25' },
        { id: 'EP-F100', model: 'فوکر 100', status: 'Active', capacity: 100, lastMaintenance: '2025-03-15' },
        { id: 'EP-A300', model: 'ایرباس A300', status: 'Inactive', capacity: 250, lastMaintenance: '2024-12-05' },
    ]);

    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newAircraft, setNewAircraft] = useState<Partial<Aircraft>>({
        id: '',
        model: '',
        status: 'Active',
        capacity: 0,
        lastMaintenance: new Date().toISOString().split('T')[0]
    });

    const statusColors: { [key: string]: { text: string, bg: string } } = {
        'Active': { text: 'text-green-700', bg: 'bg-green-100' },
        'Under Maintenance': { text: 'text-yellow-700', bg: 'bg-yellow-100' },
        'Inactive': { text: 'text-red-700', bg: 'bg-red-100' }
    };

    const statusIcons: { [key: string]: string } = {
        'Active': '✈️',
        'Under Maintenance': '🔧',
        'Inactive': '⛔'
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(aircraftList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Aircraft');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'aircraft_data.xlsx');
        toast.success('فایل با موفقیت دانلود شد');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");
        doc.text('گزارش ناوگان هواپیمایی', 14, 20);

        const tableColumn = ["کد", "مدل", "وضعیت", "ظرفیت", "آخرین تعمیر"];
        const tableRows = aircraftList.map(aircraft => [
            aircraft.id,
            aircraft.model,
            aircraft.status,
            aircraft.capacity.toString(),
            aircraft.lastMaintenance
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { font: "helvetica", fontSize: 10, halign: 'right' },
            headStyles: { fillColor: [66, 139, 202] }
        });

        doc.save('aircraft_report.pdf');
        toast.success('فایل PDF با موفقیت دانلود شد');
    };

    // Filter aircraft based on search term and status
    const filteredAircraft = aircraftList.filter(aircraft => {
        const matchesSearch =
            aircraft.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aircraft.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || aircraft.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Handle aircraft selection
    const handleSelectAircraft = (aircraft: Aircraft) => {
        setSelectedAircraft(aircraft);
    };

    // Close detail view
    const handleCloseDetail = () => {
        setSelectedAircraft(null);
    };

    // Handle adding a new aircraft
    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        // Reset the form data
        setNewAircraft({
            id: '',
            model: '',
            status: 'Active',
            capacity: 0,
            lastMaintenance: new Date().toISOString().split('T')[0]
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAircraft(prev => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) || 0 : value
        }));
    };

    const handleAddAircraft = () => {
        // Validate inputs
        if (!newAircraft.id || !newAircraft.model) {
            toast.error('لطفاً فیلدهای ضروری را تکمیل کنید');
            return;
        }

        // Create new aircraft
        const aircraft: Aircraft = {
            id: newAircraft.id!,
            model: newAircraft.model!,
            status: newAircraft.status || 'Active',
            capacity: newAircraft.capacity || 0,
            lastMaintenance: newAircraft.lastMaintenance || new Date().toISOString().split('T')[0]
        };

        // Add to aircraft list
        setAircraftList(prev => [aircraft, ...prev]);

        // Close modal and show success message
        handleCloseAddModal();
        toast.success('هواپیمای جدید با موفقیت اضافه شد');
    };

    // داده‌های نمونه برای نمودار پروازها
    const flightData = [
        { month: 'فروردین', domestic: 145, international: 80 },
        { month: 'اردیبهشت', domestic: 130, international: 85 },
        { month: 'خرداد', domestic: 155, international: 90 },
        { month: 'تیر', domestic: 190, international: 110 },
        { month: 'مرداد', domestic: 205, international: 125 },
        { month: 'شهریور', domestic: 170, international: 100 },
    ];

    // Utility function for status badges
    const getStatusBadge = (status: string) => {
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status].bg} ${statusColors[status].text}`}>
                <span className="ml-1">{statusIcons[status]}</span>
                {status === 'Active' ? 'فعال' : status === 'Under Maintenance' ? 'در حال تعمیر' : 'غیرفعال'}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">مدیریت ناوگان هواپیمایی</h1>
                        <p className="mt-2 text-gray-600">سیستم مدیریت، پایش و نظارت بر ناوگان هوایی</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            افزودن هواپیما
                        </button>
                        <div className="relative group">
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow flex items-center gap-2 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                خروجی
                            </button>
                            <div className="absolute z-10 left-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block">
                                <button
                                    onClick={exportToExcel}
                                    className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                                    <span>📊</span>
                                    <span>خروجی اکسل</span>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                                    <span>📄</span>
                                    <span>خروجی PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">کل هواپیماها</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{aircraftList.length}</h4>
                                <p className="mt-1 text-sm text-gray-500">فروند</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">هواپیماهای فعال</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{aircraftList.filter(a => a.status === 'Active').length}</h4>
                                <p className="mt-1 text-sm text-gray-500">فروند ({Math.round((aircraftList.filter(a => a.status === 'Active').length / aircraftList.length) * 100)}%)</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">در حال تعمیر</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{aircraftList.filter(a => a.status === 'Under Maintenance').length}</h4>
                                <p className="mt-1 text-sm text-gray-500">فروند ({Math.round((aircraftList.filter(a => a.status === 'Under Maintenance').length / aircraftList.length) * 100)}%)</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">غیرفعال</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{aircraftList.filter(a => a.status === 'Inactive').length}</h4>
                                <p className="mt-1 text-sm text-gray-500">فروند ({Math.round((aircraftList.filter(a => a.status === 'Inactive').length / aircraftList.length) * 100)}%)</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="جستجو بر اساس کد یا مدل هواپیما..."
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg shadow-sm w-full md:w-48"
                >
                    <option value="All">همه وضعیت‌ها</option>
                    <option value="Active">فعال</option>
                    <option value="Under Maintenance">در حال تعمیر</option>
                    <option value="Inactive">غیرفعال</option>
                </select>
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aircraft Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">فهرست هواپیماها</h3>
                            <div className="flex items-center">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    مشاهده همه
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-4">در حال بارگذاری اطلاعات هواپیماها...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مدل</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ظرفیت</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">آخرین تعمیر</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAircraft.length > 0 ? (
                                            filteredAircraft.map((aircraft) => (
                                                <tr key={aircraft.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{aircraft.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{aircraft.model}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {getStatusBadge(aircraft.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{aircraft.capacity} نفر</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {new Date(aircraft.lastMaintenance).toLocaleDateString('fa-IR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => handleSelectAircraft(aircraft)}
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
                                                    هیچ هواپیمایی با معیارهای جستجوی شما یافت نشد.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Flight Chart */}
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
                            <BarChart data={flightData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="domestic" name="پروازهای داخلی" fill="#60A5FA" />
                                <Bar dataKey="international" name="پروازهای بین‌المللی" fill="#F87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Maintenance Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">وضعیت تعمیر و نگهداری</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">بروز شده</span>
                                    <span className="text-sm font-medium text-green-600">3 فروند</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: '60%' }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">نیاز به بازبینی</span>
                                    <span className="text-sm font-medium text-yellow-600">1 فروند</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: '20%' }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">عدم سرویس طولانی</span>
                                    <span className="text-sm font-medium text-red-600">1 فروند</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{ width: '20%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مشاهده جزئیات تعمیرات
                        </button>
                    </div>

                    {/* Upcoming Maintenance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">برنامه تعمیرات پیش رو</h3>
                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-medium text-gray-900">بازبینی دوره‌ای A چک</h4>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gray-600">EP-B737</span>
                                    <span className="text-blue-600">1402/02/15</span>
                                </div>
                            </div>
                            <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-medium text-gray-900">تعویض قطعات موتور</h4>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gray-600">EP-A320</span>
                                    <span className="text-blue-600">1402/02/25</span>
                                </div>
                            </div>
                            <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-medium text-gray-900">چک C</h4>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gray-600">EP-F100</span>
                                    <span className="text-blue-600">1402/03/10</span>
                                </div>
                            </div>
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مدیریت برنامه تعمیرات
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
                                <span className="text-sm font-medium text-gray-700">گواهینامه‌ها</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">سوابق پرواز</span>
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

            {/* Aircraft Detail Modal */}
            {selectedAircraft && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedAircraft.model}</h2>
                            <button
                                onClick={handleCloseDetail}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="mb-2"><span className="font-semibold">کد هواپیما:</span> {selectedAircraft.id}</p>
                                <p className="mb-2"><span className="font-semibold">وضعیت:</span> {selectedAircraft.status === 'Active' ? 'فعال' : selectedAircraft.status === 'Under Maintenance' ? 'در حال تعمیر' : 'غیرفعال'}</p>
                                <p className="mb-2"><span className="font-semibold">ظرفیت:</span> {selectedAircraft.capacity} نفر</p>
                                <p className="mb-2"><span className="font-semibold">آخرین تعمیر:</span> {new Date(selectedAircraft.lastMaintenance).toLocaleDateString('fa-IR')}</p>
                            </div>
                            <div>
                                <p className="mb-2"><span className="font-semibold">زمان پرواز کل:</span> 12,450 ساعت</p>
                                <p className="mb-2"><span className="font-semibold">سن هواپیما:</span> 8 سال</p>
                                <p className="mb-2"><span className="font-semibold">برنامه چک بعدی:</span> 1402/05/14</p>
                                <p className="mb-2"><span className="font-semibold">آخرین مسیر:</span> تهران - استانبول</p>
                            </div>
                        </div>

                        {/* Additional Aircraft information */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">سوابق اخیر</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">تاریخ</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">نوع عملیات</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">توضیحات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 py-2 text-sm text-gray-700">1402/01/15</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">بازرسی فنی</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">چک A انجام شد</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-sm text-gray-700">1401/10/23</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">تعویض قطعه</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">سیستم اکسیژن اضطراری</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-sm text-gray-700">1401/08/10</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">تعمیر اساسی</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">سرویس کامل موتور</td>
                                        </tr>
                                    </tbody>
                                </table>
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

            {/* Add Aircraft Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">افزودن هواپیمای جدید</h2>
                            <button
                                onClick={handleCloseAddModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
                                    کد هواپیما <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    placeholder="مثال: EP-A320"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAircraft.id}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">کد شناسایی منحصر به فرد هواپیما</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
                                    مدل هواپیما <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="model"
                                    name="model"
                                    type="text"
                                    placeholder="مثال: ایرباس A320"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAircraft.model}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                                    ظرفیت (نفر)
                                </label>
                                <input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    placeholder="مثال: 180"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAircraft.capacity}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                                    وضعیت
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAircraft.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Active">فعال</option>
                                    <option value="Under Maintenance">در حال تعمیر</option>
                                    <option value="Inactive">غیرفعال</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastMaintenance">
                                    آخرین تعمیر
                                </label>
                                <input
                                    id="lastMaintenance"
                                    name="lastMaintenance"
                                    type="date"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newAircraft.lastMaintenance}
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
                                onClick={handleAddAircraft}
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