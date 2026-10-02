import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSignOutAlt,
    faUser,
    faBell,
    faMoon,
    faSun,
    faBars,
    faLanguage
} from '@fortawesome/free-solid-svg-icons';

// Define language types
type Language = 'fa' | 'en';

// Define translation interface
interface Translations {
    [key: string]: {
        fa: string;
        en: string;
    };
}

// Translations for different parts of the header
const translations: Translations = {
    pageTitle: {
        fa: 'پنل مدیریت',
        en: 'Management Panel'
    },
    logout: {
        fa: 'خروج',
        en: 'Logout'
    },
    notifications: {
        fa: 'اعلان‌ها',
        en: 'Notifications'
    },
    seeAll: {
        fa: 'مشاهده همه',
        en: 'See All'
    }
};

interface HeaderProps {
    onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [language, setLanguage] = useState<Language>('fa');
    const [notifications, setNotifications] = useState<number>(3);
    const [showNotificationsPanel, setShowNotificationsPanel] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<string>('');

    const user = {
        name: language === 'fa' ? 'حسین پیامی' : 'Hossein Payami',
        role: language === 'fa' ? 'مدیر سیستم' : 'System Administrator',
        avatar: '/avatar.png',
    };

    useEffect(() => {
        // Update the time every minute
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
            setCurrentTime(timeString);
        };

        updateTime();
        const timer = setInterval(updateTime, 60000);

        // Check if dark mode is enabled in localStorage or system preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDarkMode);

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }

        // Set document direction based on language
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        return () => clearInterval(timer);
    }, [language]);

    const handleLogout = () => {
        console.log('Logout clicked');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('darkMode', (!darkMode).toString());

        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'fa' ? 'en' : 'fa';
        setLanguage(newLanguage);
        localStorage.setItem('appLanguage', newLanguage);
    };

    const toggleNotificationsPanel = () => {
        setShowNotificationsPanel(!showNotificationsPanel);
    };

    const notificationItems = [
        {
            id: 1,
            text: {
                fa: 'پرواز شماره 724 با موفقیت انجام شد',
                en: 'Flight 724 completed successfully'
            },
            time: {
                fa: '۱۰ دقیقه پیش',
                en: '10 minutes ago'
            },
            isNew: true
        },
        {
            id: 2,
            text: {
                fa: 'پرواز شماره 305 تاخیر دارد',
                en: 'Flight 305 is delayed'
            },
            time: {
                fa: '۳۰ دقیقه پیش',
                en: '30 minutes ago'
            },
            isNew: true
        },
        // ... other notification items
    ];

    return (
        <header
            className={`bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between relative`}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
            <div className="flex items-center">
                <button
                    onClick={onToggleSidebar}
                    className="text-gray-600 dark:text-gray-200 ml-4 focus:outline-none lg:hidden"
                >
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                    {translations.pageTitle[language]}
                </div>
                <div className="mx-4 text-gray-500 dark:text-gray-400 hidden md:block">
                    {currentTime}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Toggle Button */}
                <button
                    onClick={toggleLanguage}
                    className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                    title={language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
                >
                    <FontAwesomeIcon icon={faLanguage} size="lg" />
                    <span className="sr-only">
                        {language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
                    </span>
                </button>

                {/* Dark Mode Toggle Button */}
                <button
                    onClick={toggleDarkMode}
                    className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                >
                    <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={toggleNotificationsPanel}
                        className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faBell} size="lg" />
                        {notifications > 0 && (
                            <span className="absolute top-0 left-0 -mt-1 -ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {notifications}
                            </span>
                        )}
                    </button>

                    {showNotificationsPanel && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 text-right">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="font-medium text-gray-800 dark:text-white">
                                    {translations.notifications[language]}
                                </h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notificationItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${item.isNew ? 'border-r-2 border-blue-500' : ''}`}
                                    >
                                        <div className="text-sm text-gray-800 dark:text-white">
                                            {item.text[language]}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {item.time[language]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 text-center">
                                <button className="text-sm text-blue-500 hover:text-blue-700">
                                    {translations.seeAll[language]}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-gray-700 dark:text-gray-200 text-sm">{user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{user.role}</span>
                    </div>
                    <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="mr-1">{translations.logout[language]}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;