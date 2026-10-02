import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  alert(type === 'success' ? `✅ ${message}` : `❌ ${message}`);
};

type Flight = {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  status: string;
  scheduledDeparture: string;
  scheduledArrival: string;
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
  },
  {
    id: '2',
    flightNumber: 'KA102',
    origin: 'MHD',
    destination: 'THR',
    status: 'Delayed',
    scheduledDeparture: '2025-04-17T10:00:00',
    scheduledArrival: '2025-04-17T11:30:00',
  },
];

const statusColors: { [key: string]: string } = {
  Scheduled: '#3b82f6',
  Delayed: '#f59e0b',
  Cancelled: '#ef4444',
  'In Progress': '#10b981',
};

export default function Flights() {
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
        fetch(`http://localhost:8000/api/flights/${updatedFlight.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scheduledDeparture: updatedFlight.scheduledDeparture,
            scheduledArrival: updatedFlight.scheduledArrival,
          }),
        })
          .then(res => res.ok ? showToast('تغییرات ذخیره شد', 'success') : showToast('خطا در ذخیره تغییرات', 'error'))
          .catch(err => showToast('ارتباط با سرور برقرار نشد', 'error'));
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

      const updatedFlight = flights.find(f => f.id === id);
      if (updatedFlight) {
        fetch(`http://localhost:8000/api/flights/${updatedFlight.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scheduledDeparture: updatedFlight.scheduledDeparture,
            scheduledArrival: updatedFlight.scheduledArrival,
          }),
        })
          .then((res) =>
            res.ok ? showToast('تغییرات ذخیره شد', 'success') : showToast('خطا در ذخیره تغییرات', 'error')
          )
          .catch((err) => showToast('ارتباط با سرور برقرار نشد', 'error'));
      }
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
(endHourFilter === null || new Date(f.scheduledDeparture).getHours() <= endHourFilter)  &&
        new Date(f.scheduledDeparture).toDateString() === currentDay.toDateString()
    );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">لیست پروازها</h2>
        <div className="flex gap-2 mb-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => setCurrentDay(new Date())}
          >
            امروز
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => {
              const tmr = new Date();
              tmr.setDate(tmr.getDate() + 1);
              setCurrentDay(tmr);
            }}
          >
            فردا
          </button>
        </div>

        <input
          className="border border-gray-300 px-3 py-2 rounded mb-4 w-full max-w-xs"
          type="text"
          placeholder="جستجو بر اساس شماره پرواز"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            className="border border-gray-300 px-3 py-2 rounded text-sm"
            placeholder="مبدا"
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
          />
          <input
            className="border border-gray-300 px-3 py-2 rounded text-sm"
            placeholder="مقصد"
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
          />
          <input
            type="number"
            className="border border-gray-300 px-3 py-2 rounded text-sm w-32"
            placeholder="ساعت شروع (مثلاً 8)"
            onChange={(e) => setStartHourFilter(e.target.value ? parseInt(e.target.value) : null)}
          />
          <input
            type="number"
            className="border border-gray-300 px-3 py-2 rounded text-sm w-32"
            placeholder="ساعت پایان (مثلاً 18)"
            onChange={(e) => setEndHourFilter(e.target.value ? parseInt(e.target.value) : null)}
          />
          <button
            className="px-3 py-2 bg-purple-600 text-white rounded text-sm"
            onClick={() => {
              const worksheet = XLSX.utils.json_to_sheet(flights);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights');
              const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
              const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
              saveAs(blob, 'flights.xlsx');
            }}
          >
            خروجی Excel
          </button>
          <button
            className="px-3 py-2 bg-red-500 text-white rounded text-sm"
            onClick={() => {
              const doc = new jsPDF();
              doc.autoTable({
                head: [['شماره', 'مبدا', 'مقصد', 'وضعیت', 'خروج', 'ورود']],
                body: flights.map(f => [
                  f.flightNumber,
                  f.origin,
                  f.destination,
                  f.status,
                  new Date(f.scheduledDeparture).toLocaleString(),
                  new Date(f.scheduledArrival).toLocaleString()
                ]),
              });
              doc.save('flights.pdf');
            }}
          >
            خروجی PDF
          </button>
        </div>

        <select className="border border-gray-300 px-3 py-2 rounded mb-4 w-full max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
           <option value="Enroute">Enroute</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Delayed">Delayed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          className="px-3 py-2 bg-green-500 text-white rounded text-sm mb-4"
          onClick={() => setShowAddForm(true)}
        >
          افزودن پرواز جدید
        </button>

        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">آمار وضعیت پروازها</h4>
          <div className="space-y-1 text-sm">
            {['Scheduled', 'In Progress', 'Delayed', 'Cancelled'].map((status) => {
              const count = flights.filter(f => f.status === status).length;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-24">{status}</div>
                  <div className="flex-1 bg-gray-200 h-4 rounded">
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `${count * 20}px`,
                        backgroundColor: statusColors[status] || '#9ca3af',
                      }}
                    />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative border border-gray-300 rounded p-4">
            <div className="flex text-xs text-gray-500 border-b pb-2 mb-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-[60px] text-center">{i}:00</div>
              ))}
            </div>
            {filteredFlights.map((flight) => {
              const start = new Date(flight.scheduledDeparture);
              const end = new Date(flight.scheduledArrival);
              const startHour = start.getHours() + start.getMinutes() / 60;
              const endHour = end.getHours() + end.getMinutes() / 60;
              const left = startHour * 60;
              const width = (endHour - startHour) * 60;

              return (
                <div key={flight.id} className="relative mb-4">
                  <div className="text-sm mb-1">{flight.flightNumber} - {flight.status}</div>
                  <div className="relative h-8 bg-gray-200 rounded">
                    <div
                      className="absolute top-0 left-0 h-8 rounded text-white text-xs flex items-center justify-center cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: statusColors[flight.status] || '#6b7280',
                        width: `${width}px`,
                        marginLeft: `${left}px`,
                      }}
                      title={`Flight: ${flight.flightNumber}\nFrom: ${flight.origin} → ${flight.destination}\nStatus: ${flight.status}\nDep: ${start.toLocaleTimeString()}\nArr: ${end.toLocaleTimeString()}`}
                      onMouseDown={(e) => handleDragStart(e, flight.id)}
                      onClick={() => setSelectedFlight(flight)}
                    >
                      {/* Resize handles */}
                      <div
                        className="absolute left-0 top-0 h-full w-2 bg-black/30 cursor-ew-resize"
                        onMouseDown={(e) => handleResizeStart(e, flight.id, 'left')}
                      />
                      <div
                        className="absolute right-0 top-0 h-full w-2 bg-black/30 cursor-ew-resize"
                        onMouseDown={(e) => handleResizeStart(e, flight.id, 'right')}
                      />
              {flight.origin} → {flight.destination}
              <button
                className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                onClick={() => {
                  // @ts-ignore
                  const confirmDelete = window.confirm(`آیا مطمئن هستید که می‌خواهید پرواز ${flight.flightNumber} را حذف کنید؟`);
                  if (confirmDelete) {
                    setLastDeleted(flight);
                    setFlights(flights.filter(f => f.id !== flight.id));
                    showToast('پرواز حذف شد — برای بازگردانی کلیک کن', 'success');
                  }
                }}
              >
                حذف
              </button>
                      <button
                        className="ml-2 text-white text-xs px-1 bg-red-500 hover:bg-red-600 rounded"
                        onClick={() => {
                          setFlights(flights.filter(f => f.id !== flight.id));
                          showToast('پرواز حذف شد', 'success');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="w-full md:w-64 bg-gray-100 p-4 rounded shadow-sm">
        <h3 className="text-lg font-bold mb-2">اطلاعات پرواز</h3>
        {selectedFlight ? (
          <div className="text-sm space-y-2">
            <label className="block">
              <span className="text-gray-700 text-xs">شماره پرواز:</span>
              <input
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedFlight.flightNumber}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, flightNumber: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-gray-700 text-xs">وضعیت:</span>
              <select
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedFlight.status}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, status: e.target.value })
                }
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 text-xs">زمان پرواز (شروع):</span>
              <input
                type="datetime-local"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedFlight.scheduledDeparture.slice(0, 16)}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, scheduledDeparture: new Date(e.target.value).toISOString() })
                }
              />
            </label>
            <label className="block">
              <span className="text-gray-700 text-xs">زمان پرواز (پایان):</span>
              <input
                type="datetime-local"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedFlight.scheduledArrival.slice(0, 16)}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, scheduledArrival: new Date(e.target.value).toISOString() })
                }
              />
            </label>
            <button
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded"
              onClick={() => {
                fetch(`http://localhost:8000/api/flights/${selectedFlight.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    flightNumber: selectedFlight.flightNumber,
                    status: selectedFlight.status,
                    scheduledDeparture: selectedFlight.scheduledDeparture,
                    scheduledArrival: selectedFlight.scheduledArrival,
                  }),
                })
                  .then((res) =>
                    res.ok ? showToast('تغییرات ذخیره شد', 'success') : showToast('خطا در ذخیره تغییرات', 'error')
                  )
                  .catch((err) => showToast('ارتباط با سرور برقرار نشد', 'error'));
              }}
            >
              ذخیره تغییرات
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">یک پرواز را انتخاب کنید.</p>
        )}
      </aside>
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-md space-y-4">
            <h3 className="text-lg font-bold">افزودن پرواز جدید</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newFlight: Flight = {
                  id: Date.now().toString(),
                  flightNumber: (form.flightNumber as HTMLInputElement).value,
                  origin: (form.origin as HTMLInputElement).value,
                  destination: (form.destination as HTMLInputElement).value,
                  status: (form.status as HTMLSelectElement).value,
                  scheduledDeparture: new Date().toISOString(),
                  scheduledArrival: new Date(new Date().getTime() + 3600000).toISOString(),
                };
                setFlights([...flights, newFlight]);
                setShowAddForm(false);
                showToast('پرواز اضافه شد', 'success');
              }}
              className="space-y-3 text-sm"
            >
              <input name="flightNumber" required className="w-full border rounded px-2 py-1" placeholder="شماره پرواز" />
              <input name="origin" required className="w-full border rounded px-2 py-1" placeholder="مبدا" />
              <input name="destination" required className="w-full border rounded px-2 py-1" placeholder="مقصد" />
              <select name="status" className="w-full border rounded px-2 py-1">
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Delayed</option>
                <option>Cancelled</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-gray-500">لغو</button>
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">افزودن</button>
              </div>
            </form>
          </div>
        </div>
      )}
    {lastDeleted && (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg flex items-center gap-4 z-50">
        <span>پرواز حذف شد</span>
        <button
          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
          onClick={() => {
            setFlights(prev => [...prev, lastDeleted]);
            setLastDeleted(null);
            showToast('پرواز بازگردانی شد', 'success');
          }}
        >
          بازگردانی
        </button>
        <button className="text-gray-300 hover:text-white text-xs" onClick={() => setLastDeleted(null)}>×</button>
      </div>
    )}
    </div>
  );
}