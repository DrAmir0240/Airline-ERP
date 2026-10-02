import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faPlaneArrival,
    faRulerCombined,
    faClock,
    faCheck,
    faTimes,
    faPlane,
    faInfoCircle,
    faExchangeAlt,
    faCalculator,
    faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { saveAs } from "file-saver";

interface Airport {
    name: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

const airports: Airport[] = [
    { name: "تهران (IKA)", latitude: 35.4162, longitude: 51.1543, city: "تهران", country: "ایران" },
    { name: "استانبول (IST)", latitude: 41.2633, longitude: 28.7433, city: "استانبول", country: "ترکیه" },
    { name: "دبی (DXB)", latitude: 25.2528, longitude: 55.3644, city: "دبی", country: "امارات متحده عربی" },
    { name: "پاریس (CDG)", latitude: 49.0097, longitude: 2.5479, city: "پاریس", country: "فرانسه" },
    { name: "لندن (LHR)", latitude: 51.4775, longitude: -0.4614, city: "لندن", country: "انگلستان" },
];

const planeIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2278/2278088.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

export default function FlightRouteCalculate() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [distance, setDistance] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("");
    const [flightPath, setFlightPath] = useState<[number, number][]>([]);
    const [showMap, setShowMap] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const originAirport = airports.find((airport) => airport.name === origin);
        const destinationAirport = airports.find((airport) => airport.name === destination);

        if (originAirport && destinationAirport) {
            const distance = calculateDistance(
                originAirport.latitude,
                originAirport.longitude,
                destinationAirport.latitude,
                destinationAirport.longitude
            );

            const estimatedTime = calculateEstimatedTime(distance);

            setDistance(distance.toFixed(0));
            setEstimatedTime(estimatedTime.toFixed(0));
            setFlightPath([
                [originAirport.latitude, originAirport.longitude],
                [destinationAirport.latitude, destinationAirport.longitude],
            ]);
            setShowMap(true);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance * 0.539957; // Convert to nautical miles
    };

    const deg2rad = (deg: number): number => {
        return deg * (Math.PI / 180);
    };

    const calculateEstimatedTime = (distance: number): number => {
        const averageSpeed = 500; // Average flight speed in knots
        const time = distance / averageSpeed;
        return time * 60; // Convert to minutes
    };

    const handleReset = () => {
        setOrigin("");
        setDestination("");
        setDistance("");
        setEstimatedTime("");
        setFlightPath([]);
        setShowMap(false);
        setShowDetails(false);
    };

    const handleSwap = () => {
        setOrigin(destination);
        setDestination(origin);
    };

    const handleExport = () => {
        const data = {
            origin,
            destination,
            distance: `${distance} nautical miles`,
            estimatedTime: `${estimatedTime} minutes`,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json;charset=utf-8",
        });
        saveAs(blob, "flight_route.json");
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    <FontAwesomeIcon icon={faPlane} className="ml-2" />
                    محاسبه مسیر پرواز
                </h2>
                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                >
                    <FontAwesomeIcon icon={faInfoCircle} className="ml-1" />
                    {showDetails ? "مخفی کردن جزئیات" : "نمایش جزئیات"}
                </button>
            </div>

            {showDetails && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-300 rounded-md">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">جزئیات محاسبه مسیر پرواز</h3>
                    <p className="text-gray-700">
                        این ابزار به شما امکان می‌دهد تا مسیر پرواز بین دو فرودگاه را محاسبه کنید. با انتخاب فرودگاه مبدا و مقصد،
                        فاصله و زمان تقریبی پرواز محاسبه شده و نمایش داده می‌شود. همچنین می‌توانید مسیر پرواز را روی نقشه مشاهده
                        کنید. برای شروع، فرودگاه‌های مورد نظر خود را از لیست انتخاب کنید و روی دکمه "محاسبه مسیر" کلیک کنید.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">فرودگاه مبدا</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </span>
                        <select
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                            required
                        >
                            <option value="">انتخاب فرودگاه مبدا</option>
                            {airports.map((airport) => (
                                <option key={airport.name} value={airport.name}>
                                    {airport.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">فرودگاه مقصد</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <FontAwesomeIcon icon={faPlaneArrival} />
                        </span>
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                            required
                        >
                            <option value="">انتخاب فرودگاه مقصد</option>
                            {airports.map((airport) => (
                                <option key={airport.name} value={airport.name}>
                                    {airport.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-span-full flex justify-end mt-4 space-x-4 rtl:space-x-reverse">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                        <FontAwesomeIcon icon={faTimes} className="ml-2" />
                        پاک کردن
                    </button>
                    <button
                        type="button"
                        onClick={handleSwap}
                        className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} className="ml-2" />
                        جابجایی
                    </button>
                    <button
                        type="submit"
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        <FontAwesomeIcon icon={faCalculator} className="ml-2" />
                        محاسبه مسیر
                    </button>
                </div>
            </form>

            {origin && destination && distance && estimatedTime && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-300 rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-blue-800">
                            <FontAwesomeIcon icon={faPlane} className="ml-2" />
                            خلاصه مسیر پرواز
                        </h3>
                        <button
                            type="button"
                            onClick={handleExport}
                            className="flex items-center text-green-600 hover:text-green-800 focus:outline-none"
                        >
                            <FontAwesomeIcon icon={faFileExport} className="ml-1" />
                            خروجی JSON
                        </button>
                    </div>
                    <ul className="text-gray-700 space-y-2">
                        <li>
                            <strong>مبدا:</strong> {origin} ({airports.find((a) => a.name === origin)?.city},{" "}
                            {airports.find((a) => a.name === origin)?.country})
                        </li>
                        <li>
                            <strong>مقصد:</strong> {destination} ({airports.find((a) => a.name === destination)?.city},{" "}
                            {airports.find((a) => a.name === destination)?.country})
                        </li>
                        <li>
                            <strong>فاصله:</strong> {distance} مایل دریایی
                        </li>
                        <li>
                            <strong>زمان پرواز:</strong> {estimatedTime} دقیقه
                        </li>
                    </ul>
                </div>
            )}

            {showMap && (
                <div className="mt-8">
                    <MapContainer center={[35.6892, 51.389]} zoom={5} style={{ height: "400px", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={flightPath[0]} icon={planeIcon}>
                            <Popup>{origin}</Popup>
                        </Marker>
                        <Marker position={flightPath[1]} icon={planeIcon}>
                            <Popup>{destination}</Popup>
                        </Marker>
                        <Polyline positions={flightPath} color="blue" />
                    </MapContainer>
                </div>
            )}
        </div>
    );
}