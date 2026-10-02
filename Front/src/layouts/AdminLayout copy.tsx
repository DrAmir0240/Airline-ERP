import React, { useState } from 'react';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../pages/Dashboard';
import Flights from '../pages/FlightOperations';
import Departure from '../pages/Departures';
import FlightMap from '../pages/FlightMap';
import FlightMapLive from '../pages/FlightMapLive';
import Crew from '../pages/Crew';
import Aircraft from '../pages/Aircraft';
import FeulManagement from '../pages/FeulManagement';


import LiveFlight from '../pages/LiveFlights';
import FlightOps from '../pages/FlightOps';
import Flighttt from '../pages/FlightManagement';
import WeightAndBalance from '../pages/WeightAndBalance';
import AirportTrafficLayer from '../pages/FlightControlSystem';
// import FlightRadar from '../pages/FlightRadar';
import FlightMonitoringPage from '../pages/FlightMonitoringPage';
import Passengers from '../pages/Passengers';
import Maintenance from '../pages/Maintenance';
import Finance from '../pages/Finance';
import Security from '../pages/Security';
import Settings from '../pages/Settings';
import { faGauge, faPlaneDeparture, faMap, faUsers, faGasPump, faUserFriends, faWrench, faMoneyBillWave, faUserShield, faCogs } from '@fortawesome/free-solid-svg-icons';
import { Label } from 'recharts';

const sections = [
    { key: "Dashboard", label: "داشبورد", icon: faGauge },
    { key: "Flight Ops", label: "عملیات پرواز", icon: faPlaneDeparture },
    { key: "Flight Monitoring", label: "مانیتورینگ پرواز", icon: faMap },
    { key: "Flighttt", label: "Flighttt", icon: faMap },
    { key: "Departure", label: "Departure", icon: faMap },
    { key: "WeightAndBalance", label: "WeightAndBalance", icon: faMap },
    { key: "Airport TrafficLayer", label: "AirportTrafficLayer", icon: faMap },
    { key: "Flight Map", label: "نقشه پرواز", icon: faMap },
    { key: "Flight Map Live", label: "نقشه زنده", icon: faMap },
    { key: "Crew", label: "خدمه", icon: faUsers },
    { key: "Aircraft", label: "هواپیما", icon: faPlaneDeparture },
    { key: "Feul Management", label: "مدیریت سوخت", icon: faGasPump },
    { key: "departure", label: "Departure", icon: faGasPump },
    { key: "Passengers", label: "مسافران", icon: faUserFriends },
    { key: "Maintenance", label: "تعمیرات", icon: faWrench },
    { key: "Finance", label: "مالی", icon: faMoneyBillWave },
    { key: "Security", label: "امنیت", icon: faUserShield },
    { key: "Settings", label: "تنظیمات", icon: faCogs }
];

export default function AdminLayout() {
    const [section, setSection] = useState("Dashboard");

    return (
        <div className="flex h-screen flex-col">
            <Header onToggleSidebar={() => { }} />
            <main>
                <div className="flex flex-1">
                    <Sidebar sections={sections} selected={section} onSelect={setSection} />
                    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                        {section === "Dashboard" && <Dashboard />}
                        {/* {section === "Flights" && <Flights />} */}
                        {section === "Flight Ops" && <FlightOps />}
                        {section === "Flighttt" && <Flighttt />}

                        {/* {section === "FlightRadar" && <FlightRadar  flights={[]} />} */}


                        {section === "FlightMap" && <FlightMap />}
                        {section === "Flight Map Live" && <FlightMapLive flights={[]} />}
                        {section === "Flight Monitoring" && <FlightMonitoringPage />}


                        {section === "Crew" && <Crew />}
                        {section === "Aircraft" && <Aircraft />}
                        {section === "Feul Management" && <FeulManagement />}
                        {section === "Passengers" && <Passengers />}
                        {section === "Maintenance" && <Maintenance />}
                        {section === "Finance" && <Finance />}
                        {section === "Security" && <Security />}
                        {section === "Settings" && <Settings />}
                    </main>
                </div>
            </main>
            <Footer appVersion="1.2.3" />
        </div>
    );
}