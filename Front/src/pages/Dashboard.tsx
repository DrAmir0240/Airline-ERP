import React, { useState, useEffect, useRef, useContext } from 'react';
import SettingsContext from "../context/SettingsContext";

export default function Dashboard() {
  const { settings } = useContext(SettingsContext);
  const colorScheme = settings.colorScheme;

  const stats = [
    { title: "کل پروازها", value: 128, color: "bg-blue-500" },
    { title: "عملیات سوخت‌گیری", value: 34, color: "bg-green-500" },
    { title: "تعداد خدمه", value: 76, color: "bg-yellow-500" },
    { title: "درآمد ماهانه", value: "۴۵۰٬۰۰۰٬۰۰۰ تومان", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">داشبورد</h2>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-lg shadow p-4 text-white ${item.color} transition-all`}
          >
            <h3 className="text-sm font-medium">{item.title}</h3>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {colorScheme === "dark" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
          توجه: حالت تاریک فعال است. برخی رنگ‌ها ممکن است واضح نباشند.
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">وضعیت سیستم</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
            <h4 className="text-sm font-medium mb-1">آخرین بروزرسانی سیستم</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">۱۴۰۳/۰۱/۲۵ - ۱۲:۴۵</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
            <h4 className="text-sm font-medium mb-1">وضعیت پایگاه‌داده</h4>
            <p className="text-sm text-green-600 dark:text-green-400">سالم</p>
          </div>
        </div>
      </div>
    </div>
  );
}