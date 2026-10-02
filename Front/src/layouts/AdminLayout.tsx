import React, { useState } from 'react';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../pages/Dashboard';
import Flights from '../pages/FlightOperations';
import Departures from '../pages/Departures';
import FlightMap from '../pages/FlightMap';
import FlightMapLive from '../pages/FlightMapLive';
import Crew from '../pages/Crew';
import CrewCurrency from '../pages/CrewCurrency';
import CrewEndorsement from '../pages/CrewEndorsement';
import Aircraft from '../pages/Aircraft';
import FeulManagement from '../pages/FeulManagement';
import Airlines from '../pages/Airlines';

import LiveFlight from '../pages/LiveFlights';
import FlightOps from '../pages/FlightOps';
import FlightManagement from '../pages/FlightManagement';
import WeightAndBalance from '../pages/WeightAndBalance';
import FlightControlSystem from '../pages/FlightControlSystem';
import FlightRadar from '../pages/FlightRadar';
import Airport from '../pages/Airports';
import FlightMonitoringPage from '../pages/FlightMonitoringPage';
import Passengers from '../pages/Passengers';
import Maintenance from '../pages/Maintenance';
import Finance from '../pages/Finance';
import Security from '../pages/Security';
import Settings from '../pages/Settings';
import FlightRouteCalculate from '../pages/FlightRouteCalculate';
import { faGauge, faPlaneDeparture, faMap, faUsers, faGasPump, faUserFriends, faWrench, faMoneyBillWave, faUserShield, faCogs } from '@fortawesome/free-solid-svg-icons';
import { Label } from 'recharts';

const sections = [
    { key: "Dashboard", label: "داشبورد", icon: faGauge },
    { key: "Flight Ops", label: "عملیات پرواز", icon: faPlaneDeparture },
    { key: "Flight Monitoring", label: "مانیتورینگ پرواز", icon: faMap },
    { key: "FlightManagement", label: "FlightManagement", icon: faMap },
    { key: "WeightAndBalance", label: "WeightAndBalance", icon: faMap },
    { key: "FlightControlSystem", label: "FlightControlSystem", icon: faMap },
    { key: "FlightMap", label: "نقشه پرواز", icon: faMap },
    { key: "FlightRadar", label: "FlightRadar", icon: faMap },
    
    { key: "FlightMapLive", label: "نقشه زنده", icon: faMap },
    { key: "Crew", label: "خدمه پرواز", icon: faUsers },
    { key: "CrewCurrency", label: "صلاحیت‌های خدمه", icon: faUsers },
    { key: "CrewEndorsement", label: "تأییدیه‌های خدمه", icon: faUsers },
    { key: "Airport", label: "فرودگاه", icon: faPlaneDeparture },
    { key: "Airlines", label: "ایرلاین", icon: faPlaneDeparture },
    { key: "Aircraft", label: "هواپیما", icon: faPlaneDeparture },
    { key: "Feul Management", label: "مدیریت سوخت", icon: faGasPump },
    { key: "LiveFlight", label: "LiveFlight", icon: faCogs },
    { key: "Departures", label: "Departures", icon: faGasPump },
    { key: "FlightRouteCalculate", label: "FlightRouteCalculate", icon: faGasPump },
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

                        {section === "Flight Ops" && <FlightOps />}
                        {section === "FlightManagement" && <FlightManagement />}
                        {section === "WeightAndBalance" && <WeightAndBalance />}
                        {section === "LiveFlight" && <LiveFlight />}
                        {section === "FlightMap" && <FlightMap />}
                        {section === "FlightRadar" && <FlightRadar flights={[]} />}
                        
                        
                        {section === "Flight Map Live" && <FlightMapLive flights={[]} />}
                        {section === "Flight Monitoring" && <FlightMonitoringPage />}
                        {section === "Crew" && <Crew />}
                        {section === "CrewCurrency" && <CrewCurrency />}
                        {section === "CrewEndorsement" && <CrewEndorsement />}
                        {section === "Airlines" && <Airlines />}
                        {section === "Airport" && <Airport />}
                        {section === "Aircraft" && <Aircraft />}
                        {section === "Feul Management" && <FeulManagement />}
                        {section === "Departures" && <Departures />}
                        {section === "FlightRouteCalculate" && <FlightRouteCalculate />}
                        {section === "FlightControlSystem" && <FlightControlSystem />}
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