import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CrewCurrency() {
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
    saveAs(blob, 'crew_currency_stats.xlsx');
    toast.success('گزارش با موفقیت صادر شد');
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
    <><div className="p-6 max-w-7xl mx-auto" dir="rtl">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">مرخصی‌ها</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
      />
    </>
  );
}