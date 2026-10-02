import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Crew() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [crewMembers, setCrewMembers] = useState([
    { id: 1, name: 'علی محمدی', role: 'خلبان', flightHours: 156, status: 'active', nextFlight: '' },
    { id: 2, name: 'مریم احمدی', role: 'مهماندار ارشد', flightHours: 128, status: 'active', nextFlight: '' },
    { id: 3, name: 'سعید کریمی', role: 'کمک خلبان', flightHours: 142, status: 'active', nextFlight: '' },
    { id: 4, name: 'فاطمه رضایی', role: 'مهماندار', flightHours: 110, status: 'training', nextFlight: '' },
    { id: 5, name: 'امیر حسینی', role: 'خلبان', flightHours: 187, status: 'active', nextFlight: '' },
  ]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(crewMembers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Crew');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'crew_stats.xlsx');
  };

  
  // داده‌های نمونه برای خدمه
  const crewStats = {
    total: 127,
    active: 98,
    training: 14,
    onLeave: 15,
    recentActivity: [
      { id: 1, name: 'علی محمدی', role: 'خلبان', flight: 'KA203', date: '1402/01/25', status: 'completed' },
      { id: 2, name: 'مریم احمدی', role: 'مهماندار ارشد', flight: 'KA198', date: '1402/01/24', status: 'completed' },
      { id: 3, name: 'سعید کریمی', role: 'کمک خلبان', flight: 'KA210', date: '1402/01/24', status: 'delayed' },
      { id: 4, name: 'فاطمه رضایی', role: 'مهماندار', flight: 'KA205', date: '1402/01/23', status: 'completed' },
      { id: 5, name: 'امیر حسینی', role: 'خلبان', flight: 'KA215', date: '1402/01/23', status: 'scheduled' },
    ],
    upcomingTrainings: [
      { id: 1, title: 'دوره بازآموزی ایمنی', participants: 12, date: '1402/02/05' },
      { id: 2, title: 'آموزش تشریفات ویژه', participants: 8, date: '1402/02/10' },
      { id: 3, title: 'مدیریت بحران', participants: 15, date: '1402/02/15' },
    ],
    certifications: {
      valid: 110,
      expiringSoon: 12,
      expired: 5
    }
  };

  // داده‌های نمونه برای نمودار شیفت‌ها
  const shiftsData = [
    { day: 'شنبه', morning: 35, afternoon: 30, night: 25 },
    { day: 'یکشنبه', morning: 32, afternoon: 28, night: 20 },
    { day: 'دوشنبه', morning: 30, afternoon: 32, night: 22 },
    { day: 'سه‌شنبه', morning: 34, afternoon: 29, night: 24 },
    { day: 'چهارشنبه', morning: 36, afternoon: 31, night: 26 },
    { day: 'پنج‌شنبه', morning: 38, afternoon: 33, night: 28 },
    { day: 'جمعه', morning: 25, afternoon: 25, night: 20 },
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
            <h1 className="text-3xl font-bold text-gray-800">مدیریت خدمه پرواز</h1>
            <p className="mt-2 text-gray-600">سیستم مدیریت، برنامه‌ریزی و نظارت بر خدمه پرواز</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              افزودن خدمه
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow flex items-center gap-2 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              گزارش‌گیری
            </button>
          </div>
          {/* New Feature: Crew Performance Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">آمار عملکرد خدمه</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>میانگین امتیاز رضایت مشتری</span>
                <span className="font-bold text-green-600">4.6 / 5</span>
              </div>
              <div className="flex justify-between">
                <span>میانگین ساعات پرواز ماهانه</span>
                <span className="font-bold text-blue-600">87 ساعت</span>
              </div>
              <div className="flex justify-between">
                <span>خدمه دارای امتیاز عالی</span>
                <span className="font-bold text-purple-600">23 نفر</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium">
              مشاهده جزئیات عملکرد
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">کل خدمه</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900">{crewStats.total}</h4>
                <p className="mt-1 text-sm text-gray-500">نفر</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">خدمه فعال</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900">{crewStats.active}</h4>
                <p className="mt-1 text-sm text-gray-500">نفر ({Math.round((crewStats.active / crewStats.total) * 100)}%)</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">در حال آموزش</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900">{crewStats.training}</h4>
                <p className="mt-1 text-sm text-gray-500">نفر ({Math.round((crewStats.training / crewStats.total) * 100)}%)</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479..." />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">در مرخصی</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900">{crewStats.onLeave}</h4>
                <p className="mt-1 text-sm text-gray-500">نفر ({Math.round((crewStats.onLeave / crewStats.total) * 100)}%)</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3..." />
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
              <h3 className="text-lg font-medium text-gray-900">فعالیت‌های اخیر خدمه</h3>
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
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سمت</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">پرواز</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crewStats.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.flight}</td>
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

          {/* Shifts Chart */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">نمودار شیفت‌های کاری</h3>
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
              {/* For demo purposes, we're showing a static chart representation */}
              <div className="absolute inset-0 flex items-end justify-between p-2">
                {shiftsData.map((shift, index) => (
                  <div key={index} className="flex flex-col items-center w-1/7">
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ height: `${shift.morning * 1.2}px` }}
                        title={`صبح: ${shift.morning}`}
                      ></div>
                      <div
                        className="w-6 bg-yellow-500 rounded-t"
                        style={{ height: `${shift.afternoon * 1.2}px` }}
                        title={`بعدازظهر: ${shift.afternoon}`}
                      ></div>
                      <div
                        className="w-6 bg-indigo-500 rounded-t"
                        style={{ height: `${shift.night * 1.2}px` }}
                        title={`شب: ${shift.night}`}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">{shift.day}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">شیفت صبح</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">شیفت بعدازظهر</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">شیفت شب</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shiftsData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="morning" fill="#60A5FA" />
              <Bar dataKey="afternoon" fill="#FBBF24" />
              <Bar dataKey="night" fill="#818CF8" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Certification Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">وضعیت گواهینامه‌ها</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">معتبر</span>
                  <span className="text-sm font-medium text-green-600">{crewStats.certifications.valid} نفر</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(crewStats.certifications.valid / crewStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">در حال انقضا</span>
                  <span className="text-sm font-medium text-yellow-600">{crewStats.certifications.expiringSoon} نفر</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(crewStats.certifications.expiringSoon / crewStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">منقضی شده</span>
                  <span className="text-sm font-medium text-red-600">{crewStats.certifications.expired} نفر</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(crewStats.certifications.expired / crewStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
              مشاهده جزئیات گواهینامه‌ها
            </button>
          </div>

          {/* Upcoming Trainings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">دوره‌های آموزشی پیش رو</h3>
            <div className="space-y-4">
              {crewStats.upcomingTrainings.map((training) => (
                <div key={training.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium text-gray-900">{training.title}</h4>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600">{training.date}</span>
                    <span className="text-blue-600">{training.participants} شرکت‌کننده</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
              مدیریت دوره‌های آموزشی
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
                <span className="text-sm font-medium text-gray-700">برنامه پرواز</span>
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
                <span className="text-sm font-medium text-gray-700">ساعات کاری</span>
              </button>

              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-700">مرخصی‌ها</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl />
    </div>

  );
}