import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faWeightHanging,
    faPlane,
    faGasPump,
    faUsers,
    faSave,
    faFileAlt,
    faExclamationTriangle,
    faChartPie,
    faPrint,
    faSync,
    faInfoCircle,
    faBalanceScale
} from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface WeightData {
    cargoWeight: number;
    passengerWeight: number;
    fuelWeight: number;
    passengerCount: number;
    frontBaggageWeight: number;
    rearBaggageWeight: number;
    emptyWeight: number;
}

interface Airplane {
    name: string;
    emptyWeight: number;
    maxTakeoffWeight: number;
    maxLandingWeight: number;
    maxZeroFuelWeight: number;
    fuelCapacity: number;
    passengerCapacity: number;
    avgPassengerWeight: number;
    maxCargoWeight: number;
    maxFrontBaggageWeight: number;
    maxRearBaggageWeight: number;
    units: "kg" | "lb";
}

const airplanes: Airplane[] = [
    {
        name: "Airbus A320",
        emptyWeight: 42600,
        maxTakeoffWeight: 78000,
        maxLandingWeight: 66000,
        maxZeroFuelWeight: 62500,
        fuelCapacity: 23860,
        passengerCapacity: 180,
        avgPassengerWeight: 85,
        maxCargoWeight: 7500,
        maxFrontBaggageWeight: 2500,
        maxRearBaggageWeight: 3000,
        units: "kg",
    },
    {
        name: "Boeing 737-800",
        emptyWeight: 41413,
        maxTakeoffWeight: 79016,
        maxLandingWeight: 65317,
        maxZeroFuelWeight: 62732,
        fuelCapacity: 26020,
        passengerCapacity: 189,
        avgPassengerWeight: 85,
        maxCargoWeight: 8000,
        maxFrontBaggageWeight: 3000,
        maxRearBaggageWeight: 3500,
        units: "kg",
    },
    {
        name: "Embraer E190",
        emptyWeight: 28080,
        maxTakeoffWeight: 51800,
        maxLandingWeight: 44000,
        maxZeroFuelWeight: 40900,
        fuelCapacity: 12400,
        passengerCapacity: 114,
        avgPassengerWeight: 85,
        maxCargoWeight: 4500,
        maxFrontBaggageWeight: 1500,
        maxRearBaggageWeight: 2000,
        units: "kg",
    },
    {
        name: "Cessna 172",
        emptyWeight: 743,
        maxTakeoffWeight: 1157,
        maxLandingWeight: 1157,
        maxZeroFuelWeight: 1043,
        fuelCapacity: 212,
        passengerCapacity: 3,
        avgPassengerWeight: 77,
        maxCargoWeight: 54,
        maxFrontBaggageWeight: 54,
        maxRearBaggageWeight: 0,
        units: "kg",
    },
    {
        name: "Bombardier CRJ-900",
        emptyWeight: 21773,
        maxTakeoffWeight: 38995,
        maxLandingWeight: 35154,
        maxZeroFuelWeight: 32885,
        fuelCapacity: 8600,
        passengerCapacity: 90,
        avgPassengerWeight: 85,
        maxCargoWeight: 2200,
        maxFrontBaggageWeight: 1000,
        maxRearBaggageWeight: 1200,
        units: "kg",
    }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#19B5FF"];

export default function WeightAndBalance() {
    const [data, setData] = useState<WeightData>({
        cargoWeight: 0,
        passengerWeight: 0,
        fuelWeight: 0,
        passengerCount: 0,
        frontBaggageWeight: 0,
        rearBaggageWeight: 0,
        emptyWeight: 0,
    });

    const [selectedAirplane, setSelectedAirplane] = useState<Airplane | null>(null);
    const [showingInfo, setShowingInfo] = useState<boolean>(false);

    // Set empty weight when airplane changes
    useEffect(() => {
        if (selectedAirplane) {
            setData(prev => ({
                ...prev,
                emptyWeight: selectedAirplane.emptyWeight,
                passengerCount: 0,
                passengerWeight: 0,
                cargoWeight: 0,
                fuelWeight: 0,
                frontBaggageWeight: 0,
                rearBaggageWeight: 0,
            }));
        }
    }, [selectedAirplane]);

    // Update passenger weight when count changes
    useEffect(() => {
        if (selectedAirplane) {
            setData(prev => ({
                ...prev,
                passengerWeight: prev.passengerCount * selectedAirplane.avgPassengerWeight
            }));
        }
    }, [data.passengerCount, selectedAirplane]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: parseFloat(value) || 0,
        }));
    };

    const handleAirplaneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const airplaneName = e.target.value;
        const airplane = airplanes.find((a) => a.name === airplaneName);
        setSelectedAirplane(airplane || null);
    };

    const handleReset = () => {
        if (selectedAirplane) {
            setData({
                emptyWeight: selectedAirplane.emptyWeight,
                cargoWeight: 0,
                passengerWeight: 0,
                fuelWeight: 0,
                passengerCount: 0,
                frontBaggageWeight: 0,
                rearBaggageWeight: 0,
            });
        }
    };

    const totalWeight = data.emptyWeight + data.cargoWeight + data.passengerWeight + data.fuelWeight + data.frontBaggageWeight + data.rearBaggageWeight;
    const zeroFuelWeight = totalWeight - data.fuelWeight;
    const takeoffWeight = totalWeight;

    const handleSave = () => {
        const summary = `Weight and Balance Summary
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Selected Airplane: ${selectedAirplane?.name || "Not selected"}
${selectedAirplane
                ? `
Empty Weight: ${selectedAirplane.emptyWeight.toLocaleString()} ${selectedAirplane.units}
Max Takeoff Weight: ${selectedAirplane.maxTakeoffWeight.toLocaleString()} ${selectedAirplane.units}
Max Landing Weight: ${selectedAirplane.maxLandingWeight.toLocaleString()} ${selectedAirplane.units}
Max Zero Fuel Weight: ${selectedAirplane.maxZeroFuelWeight.toLocaleString()} ${selectedAirplane.units}
Fuel Capacity: ${selectedAirplane.fuelCapacity.toLocaleString()} ${selectedAirplane.units}
Passenger Capacity: ${selectedAirplane.passengerCapacity} passengers
`
                : ""
            }

Cargo Weight: ${data.cargoWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}
Passenger Weight: ${data.passengerWeight.toLocaleString()} ${selectedAirplane?.units || "kg"} (${data.passengerCount} passengers)
Fuel Weight: ${data.fuelWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}
Front Baggage Weight: ${data.frontBaggageWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}
Rear Baggage Weight: ${data.rearBaggageWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}

Empty Weight: ${data.emptyWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}
Zero Fuel Weight: ${zeroFuelWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}
Takeoff Weight: ${takeoffWeight.toLocaleString()} ${selectedAirplane?.units || "kg"}

Weight Limits Status:
${selectedAirplane
                ? `
Takeoff Weight Status: ${takeoffWeight > selectedAirplane.maxTakeoffWeight ? "⚠️ EXCEEDED" : "✅ OK"}
Landing Weight Status: ${takeoffWeight > selectedAirplane.maxLandingWeight ? "⚠️ EXCEEDED" : "✅ OK"}
Zero Fuel Weight Status: ${zeroFuelWeight > selectedAirplane.maxZeroFuelWeight ? "⚠️ EXCEEDED" : "✅ OK"}
`
                : "No aircraft selected"
            }
`;

        const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `weight-balance-${selectedAirplane?.name || "aircraft"}-${new Date().toISOString().slice(0, 10)}.txt`);
    };

    const handlePrint = () => {
        window.print();
    };

    const weightData = [
        { name: "Empty Weight", value: data.emptyWeight },
        { name: "Cargo", value: data.cargoWeight },
        { name: "Passengers", value: data.passengerWeight },
        { name: "Fuel", value: data.fuelWeight },
        { name: "Front Baggage", value: data.frontBaggageWeight },
        { name: "Rear Baggage", value: data.rearBaggageWeight },
    ].filter(item => item.value > 0);

    const hasExceededTakeoffWeight = selectedAirplane && takeoffWeight > selectedAirplane.maxTakeoffWeight;
    const hasExceededZeroFuelWeight = selectedAirplane && zeroFuelWeight > selectedAirplane.maxZeroFuelWeight;
    const hasExceededLandingWeight = selectedAirplane && takeoffWeight > selectedAirplane.maxLandingWeight;

    const percentTakeoffWeight = selectedAirplane ? (takeoffWeight / selectedAirplane.maxTakeoffWeight) * 100 : 0;
    const percentZeroFuelWeight = selectedAirplane ? (zeroFuelWeight / selectedAirplane.maxZeroFuelWeight) * 100 : 0;

    const isPassengerExceeded = selectedAirplane && data.passengerCount > selectedAirplane.passengerCapacity;
    const isFuelExceeded = selectedAirplane && data.fuelWeight > selectedAirplane.fuelCapacity;
    const isCargoExceeded = selectedAirplane && data.cargoWeight > selectedAirplane.maxCargoWeight;
    const isFrontBaggageExceeded = selectedAirplane && data.frontBaggageWeight > selectedAirplane.maxFrontBaggageWeight;
    const isRearBaggageExceeded = selectedAirplane && data.rearBaggageWeight > selectedAirplane.maxRearBaggageWeight;

    const hasAnyWarning = hasExceededTakeoffWeight || hasExceededZeroFuelWeight || hasExceededLandingWeight ||
        isPassengerExceeded || isFuelExceeded || isCargoExceeded || isFrontBaggageExceeded || isRearBaggageExceeded;

    return (
        <div className="p-6 mx-auto max-w-4xl bg-white rounded-lg shadow-md print:shadow-none" dir="rtl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <div className="flex items-center mb-3 md:mb-0">
                    <FontAwesomeIcon icon={faBalanceScale} className="ml-2 text-blue-600" size="2x" />
                    <h2 className="text-3xl font-bold text-gray-800">
                        محاسبه وزن و تعادل هواپیما
                    </h2>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <button
                        onClick={handlePrint}
                        className="px-3 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        title="چاپ"
                    >
                        <FontAwesomeIcon icon={faPrint} className="ml-1" />
                        <span>چاپ</span>
                    </button>
                    <button
                        onClick={() => setShowingInfo(!showingInfo)}
                        className="px-3 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        title="اطلاعات"
                    >
                        <FontAwesomeIcon icon={faInfoCircle} className="ml-1" />
                        <span>راهنما</span>
                    </button>
                </div>
            </div>

            {showingInfo && (
                <div className="p-4 mb-6 bg-teal-50 border border-teal-200 rounded-md print:hidden">
                    <h3 className="font-bold text-teal-800 mb-2">راهنمای کاربری</h3>
                    <ul className="list-disc pr-5 text-teal-700 space-y-1">
                        <li>برای شروع ابتدا هواپیمای مورد نظر را انتخاب کنید.</li>
                        <li>سپس تعداد مسافران، میزان سوخت و وزن بار را وارد کنید.</li>
                        <li>وزن خالی هواپیما به صورت خودکار تنظیم می‌شود.</li>
                        <li>در صورت تجاوز از محدودیت‌های وزنی هشدار نمایش داده می‌شود.</li>
                        <li>نتایج محاسبات را می‌توانید ذخیره یا چاپ کنید.</li>
                    </ul>
                </div>
            )}

            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 mb-4 md:mb-0 md:ml-4">
                        <label htmlFor="airplane" className="block mb-2 text-sm font-medium text-gray-700">
                            <FontAwesomeIcon icon={faPlane} className="ml-2" />
                            انتخاب هواپیما
                        </label>
                        <select
                            id="airplane"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleAirplaneChange}
                            value={selectedAirplane?.name || ""}
                        >
                            <option value="">انتخاب کنید</option>
                            {airplanes.map((airplane) => (
                                <option key={airplane.name} value={airplane.name}>
                                    {airplane.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedAirplane}
                        >
                            <FontAwesomeIcon icon={faSync} className="ml-2" />
                            بازنشانی مقادیر
                        </button>
                    </div>
                </div>
            </div>

            {selectedAirplane && (
                <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="flex items-center font-bold text-blue-800 mb-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                        اطلاعات هواپیمای {selectedAirplane.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-blue-700">
                                <span className="font-semibold">وزن خالی:</span>{" "}
                                {selectedAirplane.emptyWeight.toLocaleString()} {selectedAirplane.units}
                            </p>
                            <p className="text-blue-700">
                                <span className="font-semibold">حداکثر وزن برخاست:</span>{" "}
                                {selectedAirplane.maxTakeoffWeight.toLocaleString()} {selectedAirplane.units}
                            </p>
                        </div>
                        <div>
                            <p className="text-blue-700">
                                <span className="font-semibold">حداکثر وزن بدون سوخت:</span>{" "}
                                {selectedAirplane.maxZeroFuelWeight.toLocaleString()} {selectedAirplane.units}
                            </p>
                            <p className="text-blue-700">
                                <span className="font-semibold">حداکثر وزن فرود:</span>{" "}
                                {selectedAirplane.maxLandingWeight.toLocaleString()} {selectedAirplane.units}
                            </p>
                        </div>
                        <div>
                            <p className="text-blue-700">
                                <span className="font-semibold">ظرفیت سوخت:</span>{" "}
                                {selectedAirplane.fuelCapacity.toLocaleString()} {selectedAirplane.units}
                            </p>
                            <p className="text-blue-700">
                                <span className="font-semibold">ظرفیت مسافر:</span>{" "}
                                {selectedAirplane.passengerCapacity} نفر
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {hasAnyWarning && selectedAirplane && (
                <div className="p-4 mb-6 text-red-800 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center mb-2">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="ml-2 text-red-500"
                            size="lg"
                        />
                        <span className="font-semibold">هشدار تجاوز از محدودیت‌های وزن</span>
                    </div>
                    <ul className="pr-6 list-disc space-y-1">
                        {hasExceededTakeoffWeight && (
                            <li>
                                وزن برخاست ({takeoffWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز ({selectedAirplane.maxTakeoffWeight.toLocaleString()} {selectedAirplane.units}) تجاوز کرده است.
                            </li>
                        )}
                        {hasExceededZeroFuelWeight && (
                            <li>
                                وزن بدون سوخت ({zeroFuelWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز ({selectedAirplane.maxZeroFuelWeight.toLocaleString()} {selectedAirplane.units}) تجاوز کرده است.
                            </li>
                        )}
                        {hasExceededLandingWeight && (
                            <li>
                                وزن فرود ({takeoffWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز ({selectedAirplane.maxLandingWeight.toLocaleString()} {selectedAirplane.units}) تجاوز کرده است.
                            </li>
                        )}
                        {isPassengerExceeded && (
                            <li>
                                تعداد مسافران ({data.passengerCount} نفر) از ظرفیت هواپیما ({selectedAirplane.passengerCapacity} نفر) بیشتر است.
                            </li>
                        )}
                        {isFuelExceeded && (
                            <li>
                                وزن سوخت ({data.fuelWeight.toLocaleString()} {selectedAirplane.units}) از ظرفیت سوخت ({selectedAirplane.fuelCapacity.toLocaleString()} {selectedAirplane.units}) بیشتر است.
                            </li>
                        )}
                        {isCargoExceeded && (
                            <li>
                                وزن بار ({data.cargoWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز بار ({selectedAirplane.maxCargoWeight.toLocaleString()} {selectedAirplane.units}) بیشتر است.
                            </li>
                        )}
                        {isFrontBaggageExceeded && (
                            <li>
                                وزن بار جلو ({data.frontBaggageWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز ({selectedAirplane.maxFrontBaggageWeight.toLocaleString()} {selectedAirplane.units}) بیشتر است.
                            </li>
                        )}
                        {isRearBaggageExceeded && (
                            <li>
                                وزن بار عقب ({data.rearBaggageWeight.toLocaleString()} {selectedAirplane.units}) از حداکثر وزن مجاز ({selectedAirplane.maxRearBaggageWeight.toLocaleString()} {selectedAirplane.units}) بیشتر است.
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <form className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label htmlFor="passengerCount" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faUsers} className="ml-2" />
                        تعداد مسافران
                    </label>
                    <input
                        type="number"
                        id="passengerCount"
                        name="passengerCount"
                        value={data.passengerCount}
                        onChange={handleChange}
                        min="0"
                        max={selectedAirplane?.passengerCapacity || 999}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${isPassengerExceeded ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        disabled={!selectedAirplane}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            حداکثر ظرفیت: {selectedAirplane.passengerCapacity} نفر
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="fuelWeight" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faGasPump} className="ml-2" />
                        وزن سوخت ({selectedAirplane?.units || "kg"})
                    </label>
                    <input
                        type="number"
                        id="fuelWeight"
                        name="fuelWeight"
                        value={data.fuelWeight}
                        onChange={handleChange}
                        min="0"
                        max={selectedAirplane?.fuelCapacity || 999999}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${isFuelExceeded ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        disabled={!selectedAirplane}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            حداکثر ظرفیت: {selectedAirplane.fuelCapacity.toLocaleString()} {selectedAirplane.units}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="cargoWeight" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faWeightHanging} className="ml-2" />
                        وزن بار اصلی ({selectedAirplane?.units || "kg"})
                    </label>
                    <input
                        type="number"
                        id="cargoWeight"
                        name="cargoWeight"
                        value={data.cargoWeight}
                        onChange={handleChange}
                        min="0"
                        max={selectedAirplane?.maxCargoWeight || 999999}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${isCargoExceeded ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        disabled={!selectedAirplane}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            حداکثر وزن مجاز: {selectedAirplane.maxCargoWeight.toLocaleString()} {selectedAirplane.units}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="frontBaggageWeight" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faWeightHanging} className="ml-2" />
                        وزن بار قسمت جلو ({selectedAirplane?.units || "kg"})
                    </label>
                    <input
                        type="number"
                        id="frontBaggageWeight"
                        name="frontBaggageWeight"
                        value={data.frontBaggageWeight}
                        onChange={handleChange}
                        min="0"
                        max={selectedAirplane?.maxFrontBaggageWeight || 999999}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${isFrontBaggageExceeded ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        disabled={!selectedAirplane}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            حداکثر وزن مجاز: {selectedAirplane.maxFrontBaggageWeight.toLocaleString()} {selectedAirplane.units}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="rearBaggageWeight" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faWeightHanging} className="ml-2" />
                        وزن بار قسمت عقب ({selectedAirplane?.units || "kg"})
                    </label>
                    <input
                        type="number"
                        id="rearBaggageWeight"
                        name="rearBaggageWeight"
                        value={data.rearBaggageWeight}
                        onChange={handleChange}
                        min="0"
                        max={selectedAirplane?.maxRearBaggageWeight || 999999}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${isRearBaggageExceeded ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        disabled={!selectedAirplane || selectedAirplane.maxRearBaggageWeight === 0}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            حداکثر وزن مجاز: {selectedAirplane.maxRearBaggageWeight.toLocaleString()} {selectedAirplane.units}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="emptyWeight" className="block mb-2 text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faPlane} className="ml-2" />
                        وزن خالی هواپیما ({selectedAirplane?.units || "kg"})
                    </label>
                    <input
                        type="number"
                        id="emptyWeight"
                        name="emptyWeight"
                        value={data.emptyWeight}
                        readOnly
                        className="w-full p-2 border border-gray-300 bg-gray-50 rounded-md"
                        disabled={!selectedAirplane}
                    />
                    {selectedAirplane && (
                        <p className="mt-1 text-xs text-gray-500">
                            این مقدار به صورت خودکار تنظیم می‌شود
                        </p>
                    )}
                </div>
            </form>

            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                <div className="p-6 bg-gray-50 rounded-lg shadow">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={faFileAlt} className="ml-2" />
                        نتایج محاسبه
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن خالی هواپیما:</span>
                            <span className="font-semibold">{data.emptyWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن مسافران:</span>
                            <span className="font-semibold">{data.passengerWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن سوخت:</span>
                            <span className="font-semibold">{data.fuelWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن بار اصلی:</span>
                            <span className="font-semibold">{data.cargoWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن بار جلو:</span>
                            <span className="font-semibold">{data.frontBaggageWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>وزن بار عقب:</span>
                            <span className="font-semibold">{data.rearBaggageWeight.toLocaleString()} {selectedAirplane?.units || "kg"}</span>
                        </li>
                        <li className="flex justify-between items-center pt-1 border-t border-gray-400">
                            <span className="font-bold">وزن بدون سوخت:</span>
                            <span className={`font-bold ${hasExceededZeroFuelWeight ? "text-red-600" : "text-green-600"}`}>
                                {zeroFuelWeight.toLocaleString()} {selectedAirplane?.units || "kg"}
                            </span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-bold">وزن برخاست:</span>
                            <span className={`font-bold ${hasExceededTakeoffWeight ? "text-red-600" : "text-green-600"}`}>
                                {takeoffWeight.toLocaleString()} {selectedAirplane?.units || "kg"}
                            </span>
                        </li>
                    </ul>

                    {selectedAirplane && (
                        <div className="mt-4 pt-3 border-t">
                            <div className="mb-3">
                                <div className="flex justify-between mb-1 text-sm">
                                    <span>درصد وزن برخاست</span>
                                    <span>{percentTakeoffWeight.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${percentTakeoffWeight > 100
                                                ? "bg-red-600"
                                                : percentTakeoffWeight > 90
                                                    ? "bg-yellow-500"
                                                    : "bg-green-600"
                                            }`}
                                        style={{ width: `${Math.min(percentTakeoffWeight, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1 text-sm">
                                    <span>درصد وزن بدون سوخت</span>
                                    <span>{percentZeroFuelWeight.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${percentZeroFuelWeight > 100
                                                ? "bg-red-600"
                                                : percentZeroFuelWeight > 90
                                                    ? "bg-yellow-500"
                                                    : "bg-green-600"
                                            }`}
                                        style={{ width: `${Math.min(percentZeroFuelWeight, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 rounded-lg shadow">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={faChartPie} className="ml-2" />
                        نمودار توزیع وزن
                    </h3>
                    {weightData.length > 0 ? (
                        <div className="flex justify-center h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={weightData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {weightData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ${selectedAirplane?.units || "kg"}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <p>ابتدا یک هواپیما انتخاب کرده و اطلاعات را وارد کنید</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedAirplane}
                >
                    <FontAwesomeIcon icon={faSave} className="ml-2" />
                    ذخیره نتایج
                </button>
            </div>
        </div>
    );
}