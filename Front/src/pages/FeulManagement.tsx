import { useEffect, useState } from "react";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Refuel = {
  flightNumber: string;
  amount: number;
  date: string;
};

export default function FuelManagement() {
  const [chartStyle, setChartStyle] = useState('line');
  const [tension, setTension] = useState(0.2);

  const [refuels, setRefuels] = useState<Refuel[]>([
    { flightNumber: 'KA101', amount: 5000, date: '2025-04-16' },
    { flightNumber: 'KA102', amount: 4200, date: '2025-04-16' },
    { flightNumber: 'KA103', amount: 4600, date: '2025-04-15' },
    { flightNumber: 'KA104', amount: 4800, date: '2025-04-14' },
    { flightNumber: 'KA105', amount: 5200, date: '2025-04-13' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFlightNumber, setNewFlightNumber] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('all');

  const total = refuels.reduce((sum, r) => sum + r.amount, 0);
  const avg = refuels.length ? total / refuels.length : 0;
  const filteredRefuels = refuels.filter(r => {
    const matchesSearch = r.flightNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = searchDate === '' || r.date === searchDate;

    if (dateRange === 'all') return matchesSearch && matchesDate;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    if (dateRange === 'today') return matchesSearch && r.date === today;
    if (dateRange === 'yesterday') return matchesSearch && r.date === yesterday;
    if (dateRange === 'week') return matchesSearch && r.date >= lastWeek;

    return matchesSearch && matchesDate;
  });

  const chartData = {
    labels: refuels.map(r => r.date).reverse(),
    datasets: [
      {
        label: 'مصرف سوخت (لیتر)',
        data: refuels.map(r => r.amount).reverse(),
        fill: chartStyle === 'area',
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Vazirmatn, sans-serif',
            size: 14,
            weight: 'bold' as const,
          },
          color: '#374151',
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false,
        text: 'نمودار تغییرات مصرف سوخت',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const handleDelete = (index: number) => {
    setRefuels(prev => prev.filter((_, i) => i !== index));
  };

  const confirmDelete = (index: number) => {
    // Custom confirmation modal logic would go here
    if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      handleDelete(index);
    }
  };

  const handleAddRefuel = () => {
    if (!newFlightNumber || !newAmount) return;
    const newRefuel: Refuel = {
      flightNumber: newFlightNumber,
      amount: Number(newAmount),
      date: new Date().toISOString().split('T')[0],
    };
    setRefuels(prev => [newRefuel, ...prev]);
    setShowAddModal(false);
    setNewFlightNumber('');
    setNewAmount('');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(refuels);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Refuels');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Refuel_Report.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Refuel Report', 14, 16);
    doc.autoTable({
      head: [['Flight Number', 'Amount (Liters)', 'Date']],
      body: refuels.map(r => [r.flightNumber, r.amount.toLocaleString(), r.date]),
    });
    doc.save('Refuel_Report.pdf');
  };

  // Calculate trend (positive or negative) compared to previous day
  const getTrend = () => {
    if (refuels.length < 2) return 0;

    const sortedRefuels = [...refuels].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const todayTotal = sortedRefuels
      .filter(r => r.date === sortedRefuels[0].date)
      .reduce((sum, r) => sum + r.amount, 0);

    const yesterdayTotal = sortedRefuels
      .filter(r => r.date === sortedRefuels.find(r => r.date !== sortedRefuels[0].date)?.date)
      .reduce((sum, r) => sum + r.amount, 0);

    if (yesterdayTotal === 0) return 0;
    return ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
  };

  const trend = getTrend();

  // Group by date for daily consumption
  const dailyConsumption = refuels.reduce<{ [key: string]: number }>((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.amount;
    return acc;
  }, {});

  const sortedDailyDates = Object.keys(dailyConsumption).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Find max consumer flight
  const flightTotals = refuels.reduce<{ [key: string]: number }>((acc, item) => {
    acc[item.flightNumber] = (acc[item.flightNumber] || 0) + item.amount;
    return acc;
  }, {});

  const maxConsumerFlight = Object.entries(flightTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">مدیریت سوخت</h2>
            <p className="text-gray-500 mt-2">سیستم مدیریت و پایش مصرف سوخت هواپیماها</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <div className="relative group">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                افزودن سوخت‌گیری
              </button>
            </div>

            <div className="relative group">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                خروجی
              </button>
              <div className="absolute z-10 left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-200">
                <button
                  onClick={exportToExcel}
                  className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="text-green-600">📊</span>
                  <span>خروجی Excel</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="text-red-600">📄</span>
                  <span>خروجی PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              داشبورد
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              لیست سوخت‌گیری‌ها
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              تحلیل و نمودار
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">تعداد عملیات</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-900">{refuels.length}</h4>
                    <p className="mt-1 text-sm text-gray-500">عملیات سوخت‌گیری</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">مجموع سوخت</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-900">{total.toLocaleString()}</h4>
                    <p className="mt-1 text-sm text-gray-500">لیتر</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">میانگین مصرف</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-900">{Math.round(avg).toLocaleString()}</h4>
                    <p className="mt-1 text-sm text-gray-500">لیتر بر عملیات</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {trend !== 0 && (trend > 0 ? '↑' : '↓')} {Math.abs(trend).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 mr-1">نسبت به روز قبل</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">پرمصرف‌ترین پرواز</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-900">
                      {maxConsumerFlight?.[0] || '-'}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {maxConsumerFlight ? `${maxConsumerFlight[1].toLocaleString()} لیتر` : '-'}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Refuels */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">آخرین سوخت‌گیری‌ها</h3>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  مشاهده همه
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره پرواز</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مقدار (لیتر)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refuels.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.flightNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats Chart */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">مصرف روزانه</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: sortedDailyDates.slice(0, 5).reverse(),
                      datasets: [{
                        label: 'مصرف روزانه (لیتر)',
                        data: sortedDailyDates.slice(0, 5).map(date => dailyConsumption[date]).reverse(),
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        borderRadius: 4,
                        hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)'
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🔮 پیش‌بینی سوخت</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">پیش‌بینی مصرف پرواز بعدی</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(avg).toLocaleString()} لیتر</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">دقت پیش‌بینی</span>
                      <span className="text-sm font-medium text-blue-600">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">بر اساس داده‌های 5 پرواز اخیر</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">نکته مدیریتی</p>
                        <p className="text-xs text-green-700 mt-1">
                          مصرف سوخت این پرواز‌ها {trend < 0 ? 'کمتر' : 'بیشتر'} از میانگین روزهای قبل است.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="جستجو بر اساس شماره پرواز"
                    className="block w-full pr-10 border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                >
                  <option value="">همه تاریخ‌ها</option>
                  {Array.from(new Set(refuels.map(r => r.date))).sort().reverse().map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                <select
                  className="border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">همه زمان‌ها</option>
                  <option value="today">امروز</option>
                  <option value="yesterday">دیروز</option>
                  <option value="week">هفته اخیر</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره پرواز</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مقدار (لیتر)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRefuels.length > 0 ? (
                      filteredRefuels.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.flightNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingIndex === i ? (
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <span className="text-sm text-gray-700">{r.amount.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.amount > avg ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {r.amount > avg ? 'بالاتر از میانگین' : 'کمتر از میانگین'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingIndex === i ? (
                              <div className="flex gap-2">
                                <button
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() => {
                                    setRefuels(prev =>
                                      prev.map((item, idx) =>
                                        idx === i ? { ...item, amount: Number(editAmount) } : item
                                      )
                                    );
                                    setEditingIndex(null);
                                    setEditAmount('');
                                  }}
                                >
                                  ذخیره
                                </button>
                                <button
                                  className="text-gray-600 hover:text-gray-900"
                                  onClick={() => {
                                    setEditingIndex(null);
                                    setEditAmount('');
                                  }}
                                >
                                  لغو
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingIndex(i);
                                    setEditAmount(r.amount);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  ویرایش
                                </button>
                                <button
                                  onClick={() => confirmDelete(i)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  حذف
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          هیچ سوخت‌گیری با این مشخصات یافت نشد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredRefuels.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-right text-sm text-gray-500">
                  نمایش {filteredRefuels.length} مورد از {refuels.length} عملیات سوخت‌گیری
                </div>
              )}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📊 مقایسه بین پروازها</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره پرواز</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مقدار سوخت</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">درصد نسبت به میانگین</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نمودار</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refuels.map((r, i) => {
                      const percent = ((r.amount - avg) / avg) * 100;
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.flightNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.amount.toLocaleString()}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${percent > 0 ? "text-red-600" : "text-green-600"
                            }`}>
                            {percent > 0 ? "+" : ""}
                            {percent.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${percent > 0 ? "bg-red-600" : "bg-green-600"}`}
                                style={{ width: `${Math.min(Math.abs(percent), 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">📊 نمودار مصرف سوخت</h3>

                <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">🎨 نمایش:</span>
                    <select
                      className="border border-gray-300 px-3 py-1.5 rounded-md text-sm bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={chartStyle}
                      onChange={(e) => setChartStyle(e.target.value)}
                    >
                      <option value="line">خطی</option>
                      <option value="bar">میله‌ای</option>
                      <option value="area">منطقه‌ای</option>
                    </select>
                  </div>

                  {(chartStyle === 'line' || chartStyle === 'area') && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">🎚️ انحنا:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">0</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={tension}
                          onChange={(e) => setTension(Number(e.target.value))}
                          className="w-24 accent-blue-500"
                        />
                        <span className="text-xs text-gray-500">1</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 md:h-96">
                {chartStyle === 'line' && (
                  <Line
                    data={chartData}
                    options={chartOptions}
                  />
                )}
                {chartStyle === 'bar' && (
                  <Bar
                    data={{
                      ...chartData,
                      datasets: [{
                        ...chartData.datasets[0],
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        borderRadius: 4,
                        hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)'
                      }]
                    }}
                    options={chartOptions}
                  />
                )}
                {chartStyle === 'area' && (
                  <Line
                    data={{
                      ...chartData,
                      datasets: [{
                        ...chartData.datasets[0],
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgb(59, 130, 246)'
                      }]
                    }}
                    options={chartOptions}
                  />
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm font-medium text-gray-700">حداکثر مصرف</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">{Math.max(...chartData.datasets[0].data).toLocaleString()} لیتر</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {refuels.find(r => r.amount === Math.max(...chartData.datasets[0].data))?.flightNumber || ''}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-medium text-gray-700">حداقل مصرف</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{Math.min(...chartData.datasets[0].data).toLocaleString()} لیتر</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {refuels.find(r => r.amount === Math.min(...chartData.datasets[0].data))?.flightNumber || ''}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm font-medium text-gray-700">میانگین مصرف</p>
                  <p className="text-xl font-bold text-purple-600 mt-1">{Math.round(avg).toLocaleString()} لیتر</p>
                  <p className="text-xs text-gray-500 mt-1">برای {refuels.length} پرواز</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-sm font-medium text-gray-700">مصرف کل</p>
                  <p className="text-xl font-bold text-orange-600 mt-1">{total.toLocaleString()} لیتر</p>
                  <p className="text-xs text-gray-500 mt-1">در {Object.keys(dailyConsumption).length} روز</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 تحلیل مصرف روزانه</h3>
                <div className="space-y-4">
                  {sortedDailyDates.slice(0, 5).map(date => {
                    const dailyAmount = dailyConsumption[date];
                    const dailyDiff = ((dailyAmount - avg) / avg) * 100;

                    return (
                      <div key={date} className="flex items-center">
                        <div className="w-16 text-sm text-gray-600">{date}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${dailyDiff > 0 ? "bg-red-600" : "bg-green-600"}`}
                              style={{ width: `${Math.min(Math.abs(dailyAmount / Math.max(...Object.values(dailyConsumption)) * 100), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-gray-900">{dailyAmount.toLocaleString()}</div>
                        <div className={`w-20 text-right text-sm font-medium ${dailyDiff > 0 ? "text-red-600" : "text-green-600"}`}>
                          {dailyDiff > 0 ? "+" : ""}
                          {dailyDiff.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">نکته تحلیلی</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {
                          trend < 0
                            ? "روند مصرف سوخت کاهشی است که نشان‌دهنده بهبود در مدیریت سوخت می‌باشد."
                            : "روند مصرف سوخت افزایشی است که نیاز به بررسی بیشتر دارد."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 پیش‌بینی و بهینه‌سازی</h3>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-800">پیش‌بینی مصرف هفته آینده</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(avg * refuels.length).toLocaleString()} لیتر</p>
                    <p className="text-xs text-gray-500 mt-1">بر اساس میانگین مصرف فعلی</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-800">پتانسیل صرفه‌جویی</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(avg * 0.1 * refuels.length).toLocaleString()} لیتر</p>
                    <p className="text-xs text-gray-500 mt-1">با کاهش 10% در مصرف هر پرواز</p>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-green-600" style={{ width: '10%' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>وضعیت فعلی</span>
                        <span>10% کاهش</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">توصیه بهینه‌سازی</p>
                        <p className="text-xs text-green-700 mt-1">
                          با بهینه‌سازی مسیر پرواز و کاهش وزن غیرضروری می‌توان مصرف سوخت را کاهش داد.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">افزودن سوخت‌گیری جدید</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره پرواز</label>
                  <input
                    type="text"
                    placeholder="مثال: KA106"
                    className="block w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                    value={newFlightNumber}
                    onChange={(e) => setNewFlightNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مقدار سوخت (لیتر)</label>
                  <input
                    type="number"
                    placeholder="مقدار سوخت به لیتر"
                    className="block w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-sm text-blue-700">
                    تاریخ به صورت خودکار امروز ثبت می‌شود.
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowAddModal(false)}
                  >
                    انصراف
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleAddRefuel}
                    disabled={!newFlightNumber || !newAmount}
                  >
                    ذخیره
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}