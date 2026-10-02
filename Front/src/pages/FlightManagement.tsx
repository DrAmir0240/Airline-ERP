// @ts-ignore
import React, { useState, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// @ts-ignore
import {
    LineChart,
    BarChart,
    PieChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    Bar,
    Pie,
    Cell
} from 'recharts';

// Import for map
import FlightMapLive from './FlightMapLive';
import FlightRadar from './FlightRadar';



// Toast component instead of alert
const Toast = ({
    message,
    type,
    onClose,
    enableSoundAlerts = false
}: {
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
    enableSoundAlerts?: boolean
}) => {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';

    useEffect(() => {
        const timer = setTimeout(() => {
            if (enableSoundAlerts) {
                const audio = new Audio('/sounds/alert.mp3');
                audio.play().catch(() => { });
            }
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose, enableSoundAlerts]);

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

// کامپوننت مقایسه پروازها
const FlightComparison = ({ flights, onClose, darkMode }: { flights: Flight[]; onClose: () => void; darkMode: boolean }) => {
    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-6xl h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">مقایسه پروازها</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flights.map(flight => (
                        <div
                            key={flight.id}
                            className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-bold">{flight.flightNumber}</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        flight.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {
                                        flight.status === 'Scheduled' ? 'برنامه‌ریزی شده' :
                                            flight.status === 'In Progress' ? 'در حال انجام' :
                                                flight.status === 'Delayed' ? 'تاخیری' : 'لغو شده'
                                    }
                                </span>
                            </div>

                            <div className="space-y-2 flex-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">مبدا:</span>
                                    <span>{airportCodes[flight.origin] || flight.origin}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">مقصد:</span>
                                    <span>{airportCodes[flight.destination] || flight.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">زمان حرکت:</span>
                                    <span>{new Date(flight.scheduledDeparture).toLocaleTimeString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">زمان رسیدن:</span>
                                    <span>{new Date(flight.scheduledArrival).toLocaleTimeString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">هواپیما:</span>
                                    <span>{flight.aircraft || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">مسافران:</span>
                                    <span>{flight.passengers || 0}</span>
                                </div>
                            </div>

                            {flight.weather && (
                                <div className={`mt-3 p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">وضعیت آب و هوا:</span>
                                        <span>{flight.weather.conditions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">دما:</span>
                                        <span>{flight.weather.temperature || '-'}°C</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-center">
                                <div
                                    className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                                >
                                    <div
                                        className={`
                      ${flight.status === 'Scheduled' ? 'bg-blue-500' :
                                                flight.status === 'In Progress' ? 'bg-green-500' :
                                                    flight.status === 'Delayed' ? 'bg-yellow-500' : 'bg-red-500'} 
                      h-2 rounded-full
                    `}
                                        style={{
                                            width: flight.status === 'In Progress' ? '60%' :
                                                flight.status === 'Cancelled' ? '100%' :
                                                    flight.status === 'Delayed' ? '40%' : '10%'
                                        }}
                                    ></div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// کامپوننت داشبورد تحلیلی
const AnalyticsDashboard = ({ flights, onClose, darkMode }: { flights: Flight[]; onClose: () => void; darkMode: boolean }) => {
    const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    type StatusData = {
        name: string;
        value: number;
    };
    // محاسبه آمار پیشرفته
    const flightsByStatus: StatusData[] = [
        { name: 'برنامه‌ریزی شده', value: flights.filter(f => f.status === 'Scheduled').length },
        { name: 'در حال انجام', value: flights.filter(f => f.status === 'In Progress').length },
        { name: 'تاخیری', value: flights.filter(f => f.status === 'Delayed').length },
        { name: 'لغو شده', value: flights.filter(f => f.status === 'Cancelled').length }
    ];
    const flightsByDestination = Object.entries(
        flights.reduce((acc, flight) => {
            acc[flight.destination] = (acc[flight.destination] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([destination, count]) => ({
        name: airportCodes[destination] || destination,
        value: count
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    const flightsByHour = Array.from({ length: 24 }, (_, hour) => {
        return {
            hour: hour,
            count: flights.filter(flight => new Date(flight.scheduledDeparture).getHours() === hour).length
        };
    });

    const passengersByDestination = Object.entries(
        flights.reduce((acc, flight) => {
            if (flight.passengers) {
                acc[flight.destination] = (acc[flight.destination] || 0) + flight.passengers;
            }
            return acc;
        }, {} as Record<string, number>)
    ).map(([destination, passengers]) => ({
        name: airportCodes[destination] || destination,
        value: passengers
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-7xl h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">داشبورد تحلیلی</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-4">وضعیت پروازها</h4>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={flightsByStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {flightsByStatus.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {flightsByStatus.map((status, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                                    <span className="text-sm">{status.name}: {status.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-4">مقاصد محبوب</h4>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={flightsByDestination}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" name="تعداد پرواز" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-4">توزیع پروازها در ساعات روز</h4>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={flightsByHour}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" label={{ value: 'ساعت', position: 'insideBottomRight', offset: -10 }} />
                                    <YAxis label={{ value: 'تعداد پرواز', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" activeDot={{ r: 8 }} name="تعداد پرواز" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-4">تعداد مسافران به تفکیک مقصد</h4>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={passengersByDestination}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#10b981" name="تعداد مسافر" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="text-sm text-gray-500">کل پروازها</h4>
                        <div className="text-2xl font-bold mt-1">{flights.length}</div>
                        <div className="mt-2 text-sm">پرواز در برنامه</div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="text-sm text-gray-500">کل مسافران</h4>
                        <div className="text-2xl font-bold mt-1">{flights.reduce((sum, f) => sum + (f.passengers || 0), 0)}</div>
                        <div className="mt-2 text-sm">مسافر در برنامه</div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="text-sm text-gray-500">میانگین زمان پرواز</h4>
                        <div className="text-2xl font-bold mt-1">
                            {Math.round(flights.reduce((sum, f) => {
                                const start = new Date(f.scheduledDeparture);
                                const end = new Date(f.scheduledArrival);
                                const diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
                                return sum + diff;
                            }, 0) / flights.length)} دقیقه
                        </div>
                        <div className="mt-2 text-sm">در کل پروازها</div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="text-sm text-gray-500">میانگین مسافر در هر پرواز</h4>
                        <div className="text-2xl font-bold mt-1">
                            {Math.round(flights.reduce((sum, f) => sum + (f.passengers || 0), 0) / flights.length)}
                        </div>
                        <div className="mt-2 text-sm">نفر</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// سیستم پیش‌بینی وضعیت پرواز
const PredictiveSystem = ({ flight, onClose, darkMode }: { flight: Flight; onClose: () => void; darkMode: boolean }) => {
    // شبیه‌سازی تولید داده‌های پیش‌بینی
    const generatePrediction = (flight: Flight) => {
        // عوامل مؤثر در تأخیر
        const factors = {
            weather: flight.weather?.conditions === 'Thunderstorm' || flight.weather?.conditions === 'Rain' || flight.weather?.visibility === 'Poor',
            rush: new Date(flight.scheduledDeparture).getHours() >= 7 && new Date(flight.scheduledDeparture).getHours() <= 9,
            maintenance: Math.random() > 0.8,
            crew: flight.crew && flight.crew.length < 2,
            airTraffic: Math.random() > 0.7
        };

        const factorsList = Object.entries(factors).filter(([_, value]) => value).map(([key, _]) => key);

        const delayRisk = Math.min(
            95, Math.round((
                (factors.weather ? 30 : 0) +
                (factors.rush ? 20 : 0) +
                (factors.maintenance ? 40 : 0) +
                (factors.crew ? 25 : 0) +
                (factors.airTraffic ? 15 : 0) +
                Math.random() * 10
            ) / (Object.values(factors).filter(v => v).length || 1) * 100) / 100
        );

        const currentStatus = flight.status;
        let predictedArrival = new Date(flight.scheduledArrival);
        let predictedDelay = 0;

        if (delayRisk > 70) {
            predictedDelay = Math.round(30 + Math.random() * 60);
            predictedArrival = new Date(predictedArrival.getTime() + predictedDelay * 60000);
        } else if (delayRisk > 40) {
            predictedDelay = Math.round(10 + Math.random() * 20);
            predictedArrival = new Date(predictedArrival.getTime() + predictedDelay * 60000);
        }

        return {
            delayRisk,
            factorsList,
            predictedStatus: delayRisk > 70 ? 'Delayed' : currentStatus,
            predictedArrival,
            predictedDelay,
            certainty: Math.round(90 - delayRisk / 10)
        };
    };

    const prediction = useMemo(() => generatePrediction(flight), [flight]);

    // رنگ‌بندی بر اساس ریسک
    const getRiskColor = (risk: number) => {
        if (risk > 70) return 'text-red-500';
        if (risk > 40) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-2xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">پیش‌بینی وضعیت پرواز {flight.flightNumber}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-3">اطلاعات اصلی</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">مبدا:</span>
                                <span>{airportCodes[flight.origin] || flight.origin}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">مقصد:</span>
                                <span>{airportCodes[flight.destination] || flight.destination}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">وضعیت فعلی:</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        flight.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {
                                        flight.status === 'Scheduled' ? 'برنامه‌ریزی شده' :
                                            flight.status === 'In Progress' ? 'در حال انجام' :
                                                flight.status === 'Delayed' ? 'تاخیری' : 'لغو شده'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">زمان حرکت:</span>
                                <span>{new Date(flight.scheduledDeparture).toLocaleString('fa-IR')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">زمان رسیدن:</span>
                                <span>{new Date(flight.scheduledArrival).toLocaleString('fa-IR')}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-3">پیش‌بینی هوشمند</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">احتمال تاخیر:</span>
                                <span className={`font-bold ${getRiskColor(prediction.delayRisk)}`}>{prediction.delayRisk}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${prediction.delayRisk > 70 ? 'bg-red-500' :
                                        prediction.delayRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${prediction.delayRisk}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">وضعیت پیش‌بینی شده:</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${prediction.predictedStatus === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        prediction.predictedStatus === 'In Progress' ? 'bg-green-100 text-green-800' :
                                            prediction.predictedStatus === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {
                                        prediction.predictedStatus === 'Scheduled' ? 'به موقع' :
                                            prediction.predictedStatus === 'In Progress' ? 'در حال انجام' :
                                                prediction.predictedStatus === 'Delayed' ? 'احتمال تاخیر' : 'احتمال لغو'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">زمان رسیدن پیش‌بینی شده:</span>
                                <span>{prediction.predictedArrival.toLocaleTimeString('fa-IR')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">تاخیر احتمالی:</span>
                                <span className={prediction.predictedDelay > 0 ? 'text-yellow-500' : 'text-green-500'}>
                                    {prediction.predictedDelay > 0 ? `${prediction.predictedDelay} دقیقه` : 'بدون تاخیر'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">میزان اطمینان:</span>
                                <span>{prediction.certainty}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                    <h4 className="font-medium mb-3">عوامل مؤثر</h4>
                    {prediction.factorsList.length > 0 ? (
                        <div className="space-y-2">
                            {prediction.factorsList.map((factor, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <span className="text-yellow-500 mr-2">⚠️</span>
                                    <span>
                                        {factor === 'weather' && 'شرایط نامساعد آب و هوایی'}
                                        {factor === 'rush' && 'زمان اوج ترافیک'}
                                        {factor === 'maintenance' && 'نیاز به بررسی فنی هواپیما'}
                                        {factor === 'crew' && 'کمبود خدمه پروازی'}
                                        {factor === 'airTraffic' && 'ترافیک هوایی بالا در مقصد'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-green-500 flex items-center">
                            <span className="mr-2">✓</span>
                            <span>بدون عوامل خطر - پرواز احتمالاً به موقع انجام خواهد شد</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between">
                    <div className="text-xs text-gray-500">
                        این پیش‌بینی بر اساس داده‌های آب و هوایی، ترافیک هوایی، تاریخچه پروازها و عوامل دیگر محاسبه شده است.
                    </div>
                    <button
                        className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        onClick={onClose}
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
};
// کامپوننت هشدار و اطلاع‌رسانی
const NotificationCenter = ({ notifications, onClose, onClear, darkMode }: {
    notifications: { id: string; message: string; type: 'info' | 'warning' | 'danger'; timestamp: Date; read: boolean }[];
    onClose: () => void;
    onClear: () => void;
    darkMode: boolean;
}) => {
    return (
        <div className={`fixed inset-0 bg-black/30 flex items-start justify-end z-50`}>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} h-full w-full sm:w-96 p-4 shadow-lg animate-slideInRight`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">مرکز اطلاع‌رسانی</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClear}
                            className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            پاک کردن همه
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-100px)]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                            <p>هیچ اطلاعیه‌ای وجود ندارد</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`p-3 rounded-lg ${notification.type === 'info' ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') :
                                        notification.type === 'warning' ? (darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50') :
                                            (darkMode ? 'bg-red-900/30' : 'bg-red-50')
                                        } ${notification.read ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex">
                                        <div className="mr-3 flex-shrink-0">
                                            {notification.type === 'info' && <span className="text-blue-500">ℹ️</span>}
                                            {notification.type === 'warning' && <span className="text-yellow-500">⚠️</span>}
                                            {notification.type === 'danger' && <span className="text-red-500">🚨</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${notification.read ? 'font-normal' : 'font-semibold'}`}>{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {notification.timestamp.toLocaleTimeString('fa-IR')}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// کامپوننت مدیریت مسافران
const PassengerManagement = ({ flight, onClose, darkMode }: { flight: Flight; onClose: () => void; darkMode: boolean }) => {
    // تولید لیست مسافران فرضی
    const [passengers, setPassengers] = useState(() => {
        const count = flight.passengers || 120;
        return Array.from({ length: count }, (_, i) => ({
            id: `p-${i + 1}`,
            name: [
                'علی رضایی', 'محمد علوی', 'فاطمه محمدی', 'زهرا کریمی', 'امیر حسینی',
                'سارا احمدی', 'حسین نجفی', 'نیلوفر عزیزی', 'رضا صادقی', 'مریم موسوی'
            ][Math.floor(Math.random() * 10)],
            seatNumber: `${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}${Math.floor(Math.random() * 30) + 1}`,
            checkedIn: Math.random() > 0.3,
            boardingPass: Math.random() > 0.4,
            specialNeeds: Math.random() > 0.9 ? 'نیاز به ویلچر' : (Math.random() > 0.9 ? 'کودک' : ''),
            baggage: Math.floor(Math.random() * 3),
            passport: `IR${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
        }));
    });

    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('seatNumber');
    const [filterBy, setFilterBy] = useState('all');

    const filteredPassengers = useMemo(() => {
        let result = [...passengers];

        // اعمال فیلتر جستجو
        if (filter) {
            result = result.filter(p =>
                p.name.includes(filter) ||
                p.seatNumber.includes(filter) ||
                p.passport.includes(filter)
            );
        }

        // اعمال فیلتر وضعیت
        if (filterBy === 'checkedIn') {
            result = result.filter(p => p.checkedIn);
        } else if (filterBy === 'notCheckedIn') {
            result = result.filter(p => !p.checkedIn);
        } else if (filterBy === 'specialNeeds') {
            result = result.filter(p => p.specialNeeds);
        }

        // اعمال ترتیب‌سازی
        if (sortBy === 'seatNumber') {
            result.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
        } else if (sortBy === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'checkedIn') {
            result.sort((a, b) => (b.checkedIn ? 1 : 0) - (a.checkedIn ? 1 : 0));
        }

        return result;
    }, [passengers, filter, sortBy, filterBy]);

    const stats = useMemo(() => ({
        total: passengers.length,
        checkedIn: passengers.filter(p => p.checkedIn).length,
        withBoardingPass: passengers.filter(p => p.boardingPass).length,
        specialNeeds: passengers.filter(p => p.specialNeeds).length,
        withBaggage: passengers.filter(p => p.baggage > 0).length
    }), [passengers]);

    const toggleCheckedIn = (id: string) => {
        setPassengers(prev =>
            prev.map(p => p.id === id ? { ...p, checkedIn: !p.checkedIn } : p)
        );
    };

    const toggleBoardingPass = (id: string) => {
        setPassengers(prev =>
            prev.map(p => p.id === id ? { ...p, boardingPass: !p.boardingPass } : p)
        );
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-6xl h-[90vh] overflow-hidden flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold">مدیریت مسافران پرواز {flight.flightNumber}</h3>
                        <p className="text-sm text-gray-500">
                            مسیر: {airportCodes[flight.origin] || flight.origin} به {airportCodes[flight.destination] || flight.destination}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <div className="text-sm text-gray-500">کل مسافران</div>
                        <div className="text-xl font-bold">{stats.total}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                        <div className="text-sm text-gray-500">پذیرش شده</div>
                        <div className="text-xl font-bold text-green-600">{stats.checkedIn}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                        <div className="text-sm text-gray-500">کارت پرواز</div>
                        <div className="text-xl font-bold text-purple-600">{stats.withBoardingPass}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                        <div className="text-sm text-gray-500">نیازهای ویژه</div>
                        <div className="text-xl font-bold text-yellow-600">{stats.specialNeeds}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                        <div className="text-sm text-gray-500">با بار</div>
                        <div className="text-xl font-bold text-indigo-600">{stats.withBaggage}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="جستجوی مسافر (نام، شماره صندلی یا پاسپورت)"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                            <option value="all">همه مسافران</option>
                            <option value="checkedIn">پذیرش شده</option>
                            <option value="notCheckedIn">پذیرش نشده</option>
                            <option value="specialNeeds">نیازهای ویژه</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                            <option value="seatNumber">مرتب‌سازی: شماره صندلی</option>
                            <option value="name">مرتب‌سازی: نام</option>
                            <option value="checkedIn">مرتب‌سازی: وضعیت پذیرش</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className={`min-w-full border-collapse`}>
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <tr>
                                <th className="py-3 px-4 text-right">نام</th>
                                <th className="py-3 px-4 text-center">شماره صندلی</th>
                                <th className="py-3 px-4 text-center">شماره پاسپورت</th>
                                <th className="py-3 px-4 text-center">بار</th>
                                <th className="py-3 px-4 text-center">نیازهای ویژه</th>
                                <th className="py-3 px-4 text-center">پذیرش</th>
                                <th className="py-3 px-4 text-center">کارت پرواز</th>
                                <th className="py-3 px-4 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPassengers.map((passenger) => (
                                <tr key={passenger.id} className={`${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}>
                                    <td className="py-3 px-4">{passenger.name}</td>
                                    <td className="py-3 px-4 text-center font-mono">{passenger.seatNumber}</td>
                                    <td className="py-3 px-4 text-center font-mono">{passenger.passport}</td>
                                    <td className="py-3 px-4 text-center">{passenger.baggage} چمدان</td>
                                    <td className="py-3 px-4 text-center">
                                        {passenger.specialNeeds ? (
                                            <span className="text-yellow-500">{passenger.specialNeeds}</span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => toggleCheckedIn(passenger.id)}
                                            className={`w-6 h-6 rounded ${passenger.checkedIn ?
                                                (darkMode ? 'bg-green-600' : 'bg-green-500') :
                                                (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                                                }`}
                                        >
                                            {passenger.checkedIn && '✓'}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => toggleBoardingPass(passenger.id)}
                                            className={`w-6 h-6 rounded ${passenger.boardingPass ?
                                                (darkMode ? 'bg-purple-600' : 'bg-purple-500') :
                                                (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                                                }`}
                                            disabled={!passenger.checkedIn}
                                        >
                                            {passenger.boardingPass && '✓'}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
                                        >
                                            جزئیات
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
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
    const [enableSoundAlerts, setEnableSoundAlerts] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);
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

    // قابلیت‌های جدید
    const [view, setView] = useState<'timeline' | 'map' | 'radar' | 'clusters'>('timeline');
    const [clusterBy, setClusterBy] = useState<'status' | 'destination' | 'aircraft'>('status');
    const [showComparison, setShowComparison] = useState(false);
    const [flightsToCompare, setFlightsToCompare] = useState<Flight[]>([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showPredictive, setShowPredictive] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPassengers, setShowPassengers] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            message: 'پرواز KA102 با ۳۰ دقیقه تاخیر انجام خواهد شد',
            type: 'warning' as 'info' | 'warning' | 'danger',
            timestamp: new Date(),
            read: false
        },
        {
            id: '2',
            message: 'شرایط آب و هوایی در فرودگاه مشهد مناسب است',
            type: 'info' as 'info' | 'warning' | 'danger',
            timestamp: new Date(Date.now() - 30 * 60000),
            read: true
        },
        {
            id: '3',
            message: 'پرواز KA105 به دلیل شرایط فنی لغو شد',
            type: 'danger' as 'info' | 'warning' | 'danger',
            timestamp: new Date(Date.now() - 120 * 60000),
            read: false
        }
    ]);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ message, type });
    };
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [airlineFilter, setAirlineFilter] = useState('');
    const [minPassengers, setMinPassengers] = useState(0);
    const [maxPassengers, setMaxPassengers] = useState(1000);

    // ایجاد داده‌های خوشه‌بندی شده
    const clusteredFlights = useMemo(() => {
        const clusters: { [key: string]: Flight[] } = {};

        if (clusterBy === 'status') {
            flights.forEach(flight => {
                const status = flight.status;
                if (!clusters[status]) clusters[status] = [];
                clusters[status].push(flight);
            });
        } else if (clusterBy === 'destination') {
            flights.forEach(flight => {
                const destination = flight.destination;
                if (!clusters[destination]) clusters[destination] = [];
                clusters[destination].push(flight);
            });
        } else if (clusterBy === 'aircraft') {
            flights.forEach(flight => {
                const aircraft = flight.aircraft || 'نامشخص';
                if (!clusters[aircraft]) clusters[aircraft] = [];
                clusters[aircraft].push(flight);
            });
        }

        // ترتیب‌بندی خوشه‌ها
        return Object.entries(clusters).sort((a, b) => {
            if (clusterBy === 'status') {
                const statusOrder = { 'In Progress': 0, 'Delayed': 1, 'Scheduled': 2, 'Cancelled': 3 };
                return statusOrder[a[0] as keyof typeof statusOrder] - statusOrder[b[0] as keyof typeof statusOrder];
            }
            return b[1].length - a[1].length;
        });
    }, [flights, clusterBy]);

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

    // اضافه کردن اطلاعیه های خودکار بر اساس وضعیت پروازها
    useEffect(() => {
        const checkDelayedFlights = () => {
            const now = new Date();

            flights.forEach(flight => {
                const departureTime = new Date(flight.scheduledDeparture);
                const timeDiff = Math.abs(departureTime.getTime() - now.getTime()) / (1000 * 60); // در دقیقه

                if (flight.status === 'Delayed' && timeDiff < 120 && !notifications.some(n => n.message.includes(flight.flightNumber) && n.type === 'warning')) {
                    // اضافه کردن اطلاعیه جدید
                    const delayedNotification = {
                        id: `auto-${Date.now()}`,
                        message: `پرواز ${flight.flightNumber} از ${airportCodes[flight.origin]} به ${airportCodes[flight.destination]} با تاخیر مواجه شده است.`,
                        type: 'warning' as 'info' | 'warning' | 'danger',
                        timestamp: new Date(),
                        read: false
                    };

                    setNotifications(prev => [delayedNotification, ...prev]);

                    // نمایش تست
                    if (Math.random() > 0.7) {
                        showToast(`پرواز ${flight.flightNumber} با تاخیر انجام خواهد شد`, 'warning');
                    }
                }

                if (flight.status === 'Cancelled' && !notifications.some(n => n.message.includes(flight.flightNumber) && n.type === 'danger')) {
                    // اضافه کردن اطلاعیه لغو پرواز
                    const cancelledNotification = {
                        id: `auto-${Date.now()}`,
                        message: `پرواز ${flight.flightNumber} از ${airportCodes[flight.origin]} به ${airportCodes[flight.destination]} لغو شده است.`,
                        type: 'danger' as 'info' | 'warning' | 'danger',
                        timestamp: new Date(),
                        read: false
                    };

                    setNotifications(prev => [cancelledNotification, ...prev]);
                }
            });
        };

        // بررسی وضعیت پروازها هر دو دقیقه
        const notificationInterval = setInterval(checkDelayedFlights, 120000);

        return () => clearInterval(notificationInterval);
    }, [flights, notifications]);

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

    // افزودن یا حذف پرواز برای مقایسه
    const toggleFlightForComparison = (flight: Flight) => {
        const isSelected = flightsToCompare.some(f => f.id === flight.id);

        if (isSelected) {
            setFlightsToCompare(flightsToCompare.filter(f => f.id !== flight.id));
        } else {
            if (flightsToCompare.length < 3) {
                setFlightsToCompare([...flightsToCompare, flight]);
            } else {
                showToast('حداکثر ۳ پرواز را می‌توانید مقایسه کنید', 'warning');
            }
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        showToast('همه اطلاعیه‌ها پاک شدند', 'success');
    };

    const filteredFlights = flights
        .filter(f =>
            f.flightNumber.toLowerCase().includes(filter.toLowerCase()) &&
            (!statusFilter || f.status === statusFilter) &&
            (!originFilter || f.origin.toLowerCase().includes(originFilter.toLowerCase())) &&
            (!destinationFilter || f.destination.toLowerCase().includes(destinationFilter.toLowerCase())) &&
            (!airlineFilter || (f.aircraft?.includes(airlineFilter))) &&
            (f.passengers !== undefined && f.passengers >= minPassengers && f.passengers <= maxPassengers) &&
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




    // Toast component instead of alert
    const Toast = ({ message, type, onClose, enableSoundAlerts }: { message: string; type: 'success' | 'error' | 'warning'; onClose: () => void; enableSoundAlerts: boolean }) => {
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

    // کامپوننت مقایسه پروازها
    const FlightComparison = ({ flights, onClose, darkMode }: { flights: Flight[]; onClose: () => void; darkMode: boolean }) => {
        return (
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
                <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-6xl h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">مقایسه پروازها</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flights.map(flight => (
                            <div
                                key={flight.id}
                                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold">{flight.flightNumber}</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                            flight.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                                flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {
                                            flight.status === 'Scheduled' ? 'برنامه‌ریزی شده' :
                                                flight.status === 'In Progress' ? 'در حال انجام' :
                                                    flight.status === 'Delayed' ? 'تاخیری' : 'لغو شده'
                                        }
                                    </span>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">مبدا:</span>
                                        <span>{airportCodes[flight.origin] || flight.origin}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">مقصد:</span>
                                        <span>{airportCodes[flight.destination] || flight.destination}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">زمان حرکت:</span>
                                        <span>{new Date(flight.scheduledDeparture).toLocaleTimeString('fa-IR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">زمان رسیدن:</span>
                                        <span>{new Date(flight.scheduledArrival).toLocaleTimeString('fa-IR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">هواپیما:</span>
                                        <span>{flight.aircraft || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">مسافران:</span>
                                        <span>{flight.passengers || 0}</span>
                                    </div>
                                </div>

                                {flight.weather && (
                                    <div className={`mt-3 p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">وضعیت آب و هوا:</span>
                                            <span>{flight.weather.conditions}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">دما:</span>
                                            <span>{flight.weather.temperature || '-'}°C</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-center">
                                    <div
                                        className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                                    >
                                        <div
                                            className={`
                      ${flight.status === 'Scheduled' ? 'bg-blue-500' :
                                                    flight.status === 'In Progress' ? 'bg-green-500' :
                                                        flight.status === 'Delayed' ? 'bg-yellow-500' : 'bg-red-500'} 
                      h-2 rounded-full
                    `}
                                            style={{
                                                width: flight.status === 'In Progress' ? '60%' :
                                                    flight.status === 'Cancelled' ? '100%' :
                                                        flight.status === 'Delayed' ? '40%' : '10%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // کامپوننت داشبورد تحلیلی
    const AnalyticsDashboard = ({ flights, onClose, darkMode }: { flights: Flight[]; onClose: () => void; darkMode: boolean }) => {
        const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        type StatusData = {
            name: string;
            value: number;
        };
        // محاسبه آمار پیشرفته
        const flightsByStatus: StatusData[] = [
            { name: 'برنامه‌ریزی شده', value: flights.filter(f => f.status === 'Scheduled').length },
            { name: 'در حال انجام', value: flights.filter(f => f.status === 'In Progress').length },
            { name: 'تاخیری', value: flights.filter(f => f.status === 'Delayed').length },
            { name: 'لغو شده', value: flights.filter(f => f.status === 'Cancelled').length }
        ];

        const flightsByDestination = Object.entries(
            flights.reduce((acc, flight) => {
                acc[flight.destination] = (acc[flight.destination] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([destination, count]) => ({
            name: airportCodes[destination] || destination,
            value: count
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        const flightsByHour = Array.from({ length: 24 }, (_, hour) => {
            return {
                hour: hour,
                count: flights.filter(flight => new Date(flight.scheduledDeparture).getHours() === hour).length
            };
        });

        const passengersByDestination = Object.entries(
            flights.reduce((acc, flight) => {
                if (flight.passengers) {
                    acc[flight.destination] = (acc[flight.destination] || 0) + flight.passengers;
                }
                return acc;
            }, {} as Record<string, number>)
        ).map(([destination, passengers]) => ({
            name: airportCodes[destination] || destination,
            value: passengers
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        return (
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
                <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-7xl h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">داشبورد تحلیلی</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-4">وضعیت پروازها</h4>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={flightsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {flightsByStatus.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {flightsByStatus.map((status, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                                        <span className="text-sm">{status.name}: {status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-4">مقاصد محبوب</h4>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={flightsByDestination}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3b82f6" name="تعداد پرواز" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-4">توزیع پروازها در ساعات روز</h4>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={flightsByHour}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" label={{ value: 'ساعت', position: 'insideBottomRight', offset: -10 }} />
                                        <YAxis label={{ value: 'تعداد پرواز', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" activeDot={{ r: 8 }} name="تعداد پرواز" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-4">تعداد مسافران به تفکیک مقصد</h4>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={passengersByDestination}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#10b981" name="تعداد مسافر" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {showMiniMap && (
                        <div className="fixed bottom-4 left-4 w-64 h-40 bg-white dark:bg-gray-800 rounded shadow z-50 p-2 text-sm">
                            <p className="mb-1 font-semibold">🗺️ مینی‌مپ زنده</p>
                            <FlightMapLive
                                flights={flights.map(f => ({
                                    ...f,
                                    latitude: f.latitude ?? 0,
                                    longitude: f.longitude ?? 0
                                }))}
                            />
                        </div>
                    )}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="text-sm text-gray-500">کل پروازها</h4>
                            <div className="text-2xl font-bold mt-1">{flights.length}</div>
                            <div className="mt-2 text-sm">پرواز در برنامه</div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="text-sm text-gray-500">کل مسافران</h4>
                            <div className="text-2xl font-bold mt-1">{flights.reduce((sum, f) => sum + (f.passengers || 0), 0)}</div>
                            <div className="mt-2 text-sm">مسافر در برنامه</div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="text-sm text-gray-500">میانگین زمان پرواز</h4>
                            <div className="text-2xl font-bold mt-1">
                                {Math.round(flights.reduce((sum, f) => {
                                    const start = new Date(f.scheduledDeparture);
                                    const end = new Date(f.scheduledArrival);
                                    const diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
                                    return sum + diff;
                                }, 0) / flights.length)} دقیقه
                            </div>
                            <div className="mt-2 text-sm">در کل پروازها</div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="text-sm text-gray-500">میانگین مسافر در هر پرواز</h4>
                            <div className="text-2xl font-bold mt-1">
                                {Math.round(flights.reduce((sum, f) => sum + (f.passengers || 0), 0) / flights.length)}
                            </div>
                            <div className="mt-2 text-sm">نفر</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // سیستم پیش‌بینی وضعیت پرواز
    const PredictiveSystem = ({ flight, onClose, darkMode }: { flight: Flight; onClose: () => void; darkMode: boolean }) => {
        // شبیه‌سازی تولید داده‌های پیش‌بینی
        const generatePrediction = (flight: Flight) => {
            // عوامل مؤثر در تأخیر
            const factors = {
                weather: flight.weather?.conditions === 'Thunderstorm' || flight.weather?.conditions === 'Rain' || flight.weather?.visibility === 'Poor',
                rush: new Date(flight.scheduledDeparture).getHours() >= 7 && new Date(flight.scheduledDeparture).getHours() <= 9,
                maintenance: Math.random() > 0.8,
                crew: flight.crew && flight.crew.length < 2,
                airTraffic: Math.random() > 0.7
            };

            const factorsList = Object.entries(factors).filter(([_, value]) => value).map(([key, _]) => key);

            const delayRisk = Math.min(
                95, Math.round((
                    (factors.weather ? 30 : 0) +
                    (factors.rush ? 20 : 0) +
                    (factors.maintenance ? 40 : 0) +
                    (factors.crew ? 25 : 0) +
                    (factors.airTraffic ? 15 : 0) +
                    Math.random() * 10
                ) / (Object.values(factors).filter(v => v).length || 1) * 100) / 100
            );

            const currentStatus = flight.status;
            let predictedArrival = new Date(flight.scheduledArrival);
            let predictedDelay = 0;

            if (delayRisk > 70) {
                predictedDelay = Math.round(30 + Math.random() * 60);
                predictedArrival = new Date(predictedArrival.getTime() + predictedDelay * 60000);
            } else if (delayRisk > 40) {
                predictedDelay = Math.round(10 + Math.random() * 20);
                predictedArrival = new Date(predictedArrival.getTime() + predictedDelay * 60000);
            }

            return {
                delayRisk,
                factorsList,
                predictedStatus: delayRisk > 70 ? 'Delayed' : currentStatus,
                predictedArrival,
                predictedDelay,
                certainty: Math.round(90 - delayRisk / 10)
            };
        };

        const prediction = useMemo(() => generatePrediction(flight), [flight]);

        // رنگ‌بندی بر اساس ریسک
        const getRiskColor = (risk: number) => {
            if (risk > 70) return 'text-red-500';
            if (risk > 40) return 'text-yellow-500';
            return 'text-green-500';
        };

        return (
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
                <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg w-[95%] max-w-2xl`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">پیش‌بینی وضعیت پرواز {flight.flightNumber}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-3">اطلاعات اصلی</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">مبدا:</span>
                                    <span>{airportCodes[flight.origin] || flight.origin}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">مقصد:</span>
                                    <span>{airportCodes[flight.destination] || flight.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">وضعیت فعلی:</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                            flight.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                                                flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {
                                            flight.status === 'Scheduled' ? 'برنامه‌ریزی شده' :
                                                flight.status === 'In Progress' ? 'در حال انجام' :
                                                    flight.status === 'Delayed' ? 'تاخیری' : 'لغو شده'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">زمان حرکت:</span>
                                    <span>{new Date(flight.scheduledDeparture).toLocaleString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">زمان رسیدن:</span>
                                    <span>{new Date(flight.scheduledArrival).toLocaleString('fa-IR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className="font-medium mb-3">پیش‌بینی هوشمند</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">احتمال تاخیر:</span>
                                    <span className={`font-bold ${getRiskColor(prediction.delayRisk)}`}>{prediction.delayRisk}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${prediction.delayRisk > 70 ? 'bg-red-500' :
                                            prediction.delayRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${prediction.delayRisk}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">وضعیت پیش‌بینی شده:</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${prediction.predictedStatus === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                            prediction.predictedStatus === 'In Progress' ? 'bg-green-100 text-green-800' :
                                                prediction.predictedStatus === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {
                                            prediction.predictedStatus === 'Scheduled' ? 'به موقع' :
                                                prediction.predictedStatus === 'In Progress' ? 'در حال انجام' :
                                                    prediction.predictedStatus === 'Delayed' ? 'احتمال تاخیر' : 'احتمال لغو'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">زمان رسیدن پیش‌بینی شده:</span>
                                    <span>{prediction.predictedArrival.toLocaleTimeString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">تاخیر احتمالی:</span>
                                    <span className={prediction.predictedDelay > 0 ? 'text-yellow-500' : 'text-green-500'}>
                                        {prediction.predictedDelay > 0 ? `${prediction.predictedDelay} دقیقه` : 'بدون تاخیر'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">میزان اطمینان:</span>
                                    <span>{prediction.certainty}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                        <h4 className="font-medium mb-3">عوامل مؤثر</h4>
                        {prediction.factorsList.length > 0 ? (
                            <div className="space-y-2">
                                {prediction.factorsList.map((factor, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <span className="text-yellow-500 mr-2">⚠️</span>
                                        <span>
                                            {factor === 'weather' && 'شرایط نامساعد آب و هوایی'}
                                            {factor === 'rush' && 'زمان اوج ترافیک'}
                                            {factor === 'maintenance' && 'نیاز به بررسی فنی هواپیما'}
                                            {factor === 'weather' && 'شرایط نامساعد آب و هوایی'}
                                            {factor === 'rush' && 'زمان اوج ترافیک'}
                                            {factor === 'maintenance' && 'نیاز به بررسی فنی هواپیما'}
                                            {factor === 'crew' && 'کمبود خدمه پروازی'}
                                            {factor === 'airTraffic' && 'ترافیک هوایی بالا در مقصد'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-green-500 flex items-center">
                                <span className="mr-2">✓</span>
                                <span>بدون عوامل خطر - پرواز احتمالاً به موقع انجام خواهد شد</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <div className="text-xs text-gray-500">
                            این پیش‌بینی بر اساس داده‌های آب و هوایی، ترافیک هوایی، تاریخچه پروازها و عوامل دیگر محاسبه شده است.
                        </div>
                        <button
                            className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                            onClick={onClose}
                        >
                            بستن
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // رندر اصلی کامپوننت
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
                    {/* دکمه های قابلیت های پیشرفته */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={enableSoundAlerts}
                                onChange={() => setEnableSoundAlerts(!enableSoundAlerts)}
                            />
                            هشدارهای صوتی
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showMiniMap}
                                onChange={() => setShowMiniMap(!showMiniMap)}
                            />
                            نمایش مینی‌مپ
                        </label>
                    </div>

                    <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <button
                            className={`px-3 py-1.5 text-sm ${notifications.filter(n => !n.read).length > 0 ? 'animate-pulse' : ''}`}
                            onClick={() => setShowNotifications(true)}
                            title="مرکز اطلاع‌رسانی"
                        >
                            <span className="relative">
                                🔔
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </span>
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm`}
                            onClick={() => setShowAnalytics(true)}
                            title="داشبورد تحلیلی"
                        >
                            📊
                        </button>
                        {flightsToCompare.length > 0 && (
                            <button
                                className={`px-3 py-1.5 text-sm ${flightsToCompare.length > 0 ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => setShowComparison(true)}
                                title="مقایسه پروازها"
                            >
                                <span className="relative">
                                    🔄
                                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {flightsToCompare.length}
                                    </span>
                                </span>
                            </button>
                        )}
                    </div>

                    {/* دکمه های نمای نمایش */}
                    <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <button
                            className={`px-3 py-1.5 text-sm ${view === 'timeline' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
                            onClick={() => setView('timeline')}
                            title="نمای زمانی"
                        >
                            📆
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm ${view === 'map' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
                            onClick={() => setView('map')}
                            title="نمای نقشه"
                        >
                            🗺️
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm ${view === 'radar' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
                            onClick={() => setView('radar')}
                            title="نمای رادار"
                        >
                            📡
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm ${view === 'clusters' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : ''}`}
                            onClick={() => setView('clusters')}
                            title="نمای خوشه‌ای"
                        >
                            📊
                        </button>
                    </div>

                    <button
                        className={`px-3 py-1.5 rounded-md text-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? '☀️ حالت روز' : '🌙 حالت شب'}
                    </button>
                </div>
            </div>

            {/* دکمه‌های اصلی */}
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
                <button
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
                    onClick={() => setShowAnalytics(true)}
                >
                    <span>📈</span>
                    <span>داشبورد تحلیلی</span>
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

            {/* نمایش داشبورد تحلیلی */}
            {showAnalytics && <AnalyticsDashboard flights={flights} onClose={() => setShowAnalytics(false)} darkMode={darkMode} />}

            {/* نمایش سیستم پیش‌بینی */}
            {showPredictive && selectedFlight && <PredictiveSystem flight={selectedFlight} onClose={() => setShowPredictive(false)} darkMode={darkMode} />}

            {/* نمایش مرکز اطلاع‌رسانی */}
            {showNotifications && (
                <NotificationCenter
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onClear={clearNotifications}
                    darkMode={darkMode}
                />
            )}

            {/* نمایش مدیریت مسافران */}
            {showPassengers && selectedFlight && (
                <PassengerManagement
                    flight={selectedFlight}
                    onClose={() => setShowPassengers(false)}
                    darkMode={darkMode}
                />
            )}

            {/* نمایش مقایسه پروازها */}
            {showComparison && flightsToCompare.length > 0 && (
                <FlightComparison
                    flights={flightsToCompare}
                    onClose={() => setShowComparison(false)}
                    darkMode={darkMode}
                />
            )}

            {/* نمایش فرم افزودن پرواز جدید */}
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

            {/* نوتیفیکیشن بازگردانی پرواز حذف شده */}
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

            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                    enableSoundAlerts={enableSoundAlerts}
                />
            )}
        </div>

    )
}