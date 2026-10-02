import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PlusCircleIcon, DocumentArrowDownIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Passenger {
  id: number;
  name: string;
  flight: string;
  seat: string;
  status: string;
}

export default function Passengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, name: 'علی رضایی', flight: 'KA123', seat: '12A', status: 'checked-in' },
    { id: 2, name: 'مریم احمدی', flight: 'KA124', seat: '14C', status: 'pending' },
    { id: 3, name: 'حسن عباسی', flight: 'KA125', seat: '16B', status: 'checked-in' },
    { id: 4, name: 'سارا محمدی', flight: 'KA126', seat: '18A', status: 'cancelled' },
    { id: 5, name: 'نادر مرادی', flight: 'KA127', seat: '10F', status: 'checked-in' },
    { id: 6, name: 'لیلا سلطانی', flight: 'KA128', seat: '22C', status: 'pending' },
    { id: 7, name: 'امیر قربانی', flight: 'KA129', seat: '9D', status: 'checked-in' },
    { id: 8, name: 'زهرا رفیعی', flight: 'KA130', seat: '6B', status: 'cancelled' },
    { id: 9, name: 'کیوان مرسلی', flight: 'KA131', seat: '11E', status: 'pending' },
    { id: 10, name: 'شادی عزیزی', flight: 'KA132', seat: '20A', status: 'checked-in' },
    { id: 11, name: 'نیما صادقی', flight: 'KA133', seat: '19B', status: 'checked-in' },
    { id: 12, name: 'آزاده نیکو', flight: 'KA134', seat: '5C', status: 'pending' },
    { id: 13, name: 'پویا راد', flight: 'KA135', seat: '15F', status: 'cancelled' },
    { id: 14, name: 'نسرین فرهادی', flight: 'KA136', seat: '8A', status: 'checked-in' },
    { id: 15, name: 'مهدی یوسفی', flight: 'KA137', seat: '17D', status: 'pending' },
  ]);




  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(passengers);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setFiltered(passengers.filter(p => p.name.includes(search) || p.flight.includes(search)));
  }, [search, passengers]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Passengers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'passengers.xlsx');
  };

  const handleDelete = (id: number) => {
    const updated = passengers.filter(p => p.id !== id);
    setPassengers(updated);
    setFiltered(updated);
  };

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setIsNew(false);
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingPassenger({ id: Date.now(), name: '', flight: '', seat: '', status: 'pending' });
    setIsNew(true);
    setShowEditModal(true);
  };

  const handleSavePassenger = () => {
    if (!editingPassenger) return;
    const updated = isNew
      ? [...passengers, editingPassenger]
      : passengers.map(p => p.id === editingPassenger.id ? editingPassenger : p);
    setPassengers(updated);
    setFiltered(updated);
    setShowEditModal(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">چک‌این شده</span>;
      case 'pending':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">در انتظار</span>;
      case 'cancelled':
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">لغو شده</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">مدیریت مسافران</h1>
          <p className="mt-2 text-sm text-gray-700">مشاهده و مدیریت مسافران پروازها</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={exportToExcel}
            aria-label="Export to Excel"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <DocumentArrowDownIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            خروجی Excel
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            aria-label="Add new passenger"
            className="ml-3 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            افزودن مسافر
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام یا شماره پرواز..."
                className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mt-4">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-gray-900">
                      نام
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      پرواز
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      صندلی
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      وضعیت
                    </th>
                    <th scope="col" className="relative py-3.5 pr-3 pl-4 sm:pr-6">
                      <span className="sr-only">عملیات</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((passenger) => (
                    <tr key={passenger.id}>
                      <td className="whitespace-nowrap py-4 pr-4 pl-3 text-sm font-medium text-gray-900">
                        {passenger.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{passenger.flight}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{passenger.seat}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {statusBadge(passenger.status)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pr-3 pl-3 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => handleEdit(passenger)} aria-label="Edit passenger" className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button onClick={() => handleDelete(passenger.id)} aria-label="Delete passenger" className="mr-3 text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">
                        موردی یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 sm:mt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      {isNew ? 'افزودن مسافر جدید' : 'ویرایش مسافر'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                          نام
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={editingPassenger?.name || ''}
                            onChange={(e) => editingPassenger && setEditingPassenger({ ...editingPassenger, name: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="flight" className="block text-sm font-medium leading-6 text-gray-900">
                          پرواز
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="flight"
                            id="flight"
                            required
                            value={editingPassenger?.flight || ''}
                            onChange={(e) => editingPassenger && setEditingPassenger({ ...editingPassenger, flight: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="seat" className="block text-sm font-medium leading-6 text-gray-900">
                          صندلی
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="seat"
                            id="seat"
                            required
                            value={editingPassenger?.seat || ''}
                            onChange={(e) => editingPassenger && setEditingPassenger({ ...editingPassenger, seat: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                          وضعیت
                        </label>
                        <div className="mt-2">
                          <select
                            id="status"
                            name="status"
                            value={editingPassenger?.status || 'pending'}
                            onChange={(e) => editingPassenger && setEditingPassenger({ ...editingPassenger, status: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option value="checked-in">چک‌این شده</option>
                            <option value="pending">در انتظار</option>
                            <option value="cancelled">لغو شده</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={handleSavePassenger}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          ذخیره
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          انصراف
                        </button>
                      </div>
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

