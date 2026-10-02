import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Departures() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [departures, setDepartures] = useState([
        { id: 1, flightNumber: "KA101", origin: "تهران", destination: "استانبول", scheduledDeparture: "1402/01/26 08:30", gate: "A1", status: "scheduled" },
        { id: 2, flightNumber: "KA202", origin: "تهران", destination: "دبی", scheduledDeparture: "1402/01/26 10:00", gate: "B2", status: "boarding" },
        { id: 3, flightNumber: "KA303", origin: "مشهد", destination: "دوحه", scheduledDeparture: "1402/01/26 11:45", gate: "C3", status: "delayed" },
        { id: 4, flightNumber: "KA404", origin: "شیراز", destination: "کیش", scheduledDeparture: "1402/01/26 13:15", gate: "D4", status: "completed" },
        { id: 5, flightNumber: "KA505", origin: "اصفهان", destination: "مشهد", scheduledDeparture: "1402/01/26 14:30", gate: "E5", status: "scheduled" },
    ]);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(departures);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Departures');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'departures_stats.xlsx');
        toast.success('گزارش با موفقیت صادر شد');
    };

    // داده‌های نمونه برای آمار پروازها
    const departureStats = {
        total: 127,
        scheduled: 98,
        delayed: 14,
        boarding: 15,
        recentActivity: [
            { id: 1, flightNumber: "KA101", origin: "تهران", destination: "استانبول", date: "1402/01/25", status: "completed" },
            { id: 2, flightNumber: "KA202", origin: "تهران", destination: "دبی", date: "1402/01/24", status: "delayed" },
            { id: 3, flightNumber: "KA303", origin: "مشهد", destination: "دوحه", date: "1402/01/24", status: "boarding" },
            { id: 4, flightNumber: "KA404", origin: "شیراز", destination: "کیش", date: "1402/01/23", status: "completed" },
            { id: 5, flightNumber: "KA505", origin: "اصفهان", destination: "مشهد", date: "1402/01/23", status: "scheduled" },
        ],
        routes: [
            { id: 1, route: "تهران - استانبول", frequency: 35 },
            { id: 2, route: "تهران - دبی", frequency: 28 },
            { id: 3, route: "مشهد - دوحه", frequency: 22 },
            { id: 4, route: "شیراز - کیش", frequency: 20 },
            { id: 5, route: "اصفهان - مشهد", frequency: 15 },
        ],
        punctuality: {
            onTime: 85,
            delayed: 12,
            cancelled: 3
        }
    };

    // داده‌های نمونه برای نمودار پروازها
    const flightsData = [
        { day: 'شنبه', scheduled: 35, delayed: 5, boarding: 3 },
        { day: 'یکشنبه', scheduled: 32, delayed: 4, boarding: 2 },
        { day: 'دوشنبه', scheduled: 30, delayed: 6, boarding: 4 },
        { day: 'سه‌شنبه', scheduled: 34, delayed: 3, boarding: 2 },
        { day: 'چهارشنبه', scheduled: 36, delayed: 4, boarding: 3 },
        { day: 'پنج‌شنبه', scheduled: 38, delayed: 5, boarding: 2 },
        { day: 'جمعه', scheduled: 25, delayed: 3, boarding: 1 },
    ];

    // Utility function for status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">انجام شده</span>;
            case 'delayed':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">تاخیر</span>;
            case 'boarding':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">سوار شدن</span>;
            case 'scheduled':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">برنامه‌ریزی شده</span>;
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
                        <h1 className="text-3xl font-bold text-gray-800">مدیریت پروازهای خروجی</h1>
                        <p className="mt-2 text-gray-600">سیستم نظارت و کنترل پروازهای در حال خروج</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            ثبت پرواز جدید
                        </button>
                        <button onClick={exportToExcel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow flex items-center gap-2 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            گزارش‌گیری
                        </button>
                    </div>
                    {/* Performance Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">آمار عملکرد پروازها</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>درصد پروازهای به موقع</span>
                                <span className="font-bold text-green-600">87%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>متوسط تاخیر پروازها</span>
                                <span className="font-bold text-yellow-600">27 دقیقه</span>
                            </div>
                            <div className="flex justify-between">
                                <span>پروازهای لغو شده</span>
                                <span className="font-bold text-red-600">3 پرواز</span>
                            </div>
                        </div>
                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            جزئیات بیشتر
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">کل پروازها</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{departureStats.total}</h4>
                                <p className="mt-1 text-sm text-gray-500">پرواز</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">پروازهای برنامه‌ریزی شده</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{departureStats.scheduled}</h4>
                                <p className="mt-1 text-sm text-gray-500">پرواز ({Math.round((departureStats.scheduled / departureStats.total) * 100)}%)</p>
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
                                <p className="text-sm font-medium text-gray-500">پروازهای با تاخیر</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{departureStats.delayed}</h4>
                                <p className="mt-1 text-sm text-gray-500">پرواز ({Math.round((departureStats.delayed / departureStats.total) * 100)}%)</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">در حال سوار شدن</p>
                                <h4 className="mt-2 text-2xl font-bold text-gray-900">{departureStats.boarding}</h4>
                                <p className="mt-1 text-sm text-gray-500">پرواز ({Math.round((departureStats.boarding / departureStats.total) * 100)}%)</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">فعالیت‌های اخیر پروازها</h3>
                            <div className="flex items-center">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    مشاهده همه
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره پرواز</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبدأ</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مقصد</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {departureStats.recentActivity.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.flightNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.origin}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.destination}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(activity.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Flights Chart */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">نمودار پروازها</h3>
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
                        <div className="h-64 relative">
                            <div className="absolute inset-0 flex items-end justify-between p-2">
                                {flightsData.map((flight, index) => (
                                    <div key={index} className="flex flex-col items-center w-1/7">
                                        <div className="flex space-x-1 rtl:space-x-reverse">
                                            <div
                                                className="w-6 bg-blue-500 rounded-t"
                                                style={{ height: `${flight.scheduled * 1.2}px` }}
                                                title={`برنامه‌ریزی شده: ${flight.scheduled}`}
                                            ></div>
                                            <div
                                                className="w-6 bg-yellow-500 rounded-t"
                                                style={{ height: `${flight.delayed * 1.2}px` }}
                                                title={`با تاخیر: ${flight.delayed}`}
                                            ></div>
                                            <div
                                                className="w-6 bg-indigo-500 rounded-t"
                                                style={{ height: `${flight.boarding * 1.2}px` }}
                                                title={`در حال سوار شدن: ${flight.boarding}`}
                                            ></div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">{flight.day}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center gap-6">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                <span className="text-sm text-gray-600">برنامه‌ریزی شده</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="text-sm text-gray-600">با تاخیر</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                <span className="text-sm text-gray-600">در حال سوار شدن</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={flightsData}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="scheduled" fill="#60A5FA" />
                                <Bar dataKey="delayed" fill="#FBBF24" />
                                <Bar dataKey="boarding" fill="#818CF8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Route Frequency */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">فراوانی مسیرها</h3>
                        <div className="space-y-4">
                            {departureStats.routes.map((route) => (
                                <div key={route.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">{route.route}</span>
                                        <span className="text-sm font-medium text-blue-600">{route.frequency} پرواز</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(route.frequency / departureStats.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            مشاهده همه مسیرها
                        </button>
                    </div>

                    {/* Punctuality */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">وضعیت به‌موقع بودن</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">به‌موقع</span>
                                    <span className="text-sm font-medium text-green-600">{departureStats.punctuality.onTime}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${departureStats.punctuality.onTime}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">با تاخیر</span>
                                    <span className="text-sm font-medium text-yellow-600">{departureStats.punctuality.delayed}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${departureStats.punctuality.delayed}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">لغو شده</span>
                                    <span className="text-sm font-medium text-red-600">{departureStats.punctuality.cancelled}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{ width: `${departureStats.punctuality.cancelled}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                            جزئیات بیشتر
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
                                <span className="text-sm font-medium text-gray-700">ثبت پرواز</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">گزارش‌گیری</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0-0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">زمان‌بندی</span>
                            </button>

                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">وضعیت پروازها</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl aria-label={undefined} />
        </div>
    );
}