import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faEnvelope,
    faPhone,
    faQuestionCircle,
    faChevronUp,
    faCopyright
} from '@fortawesome/free-solid-svg-icons';
import {
    faInstagram,
    faTelegram,
    faWhatsapp
} from '@fortawesome/free-brands-svg-icons';

interface FooterProps {
    appVersion?: string;
}

const Footer: React.FC<FooterProps> = ({ appVersion = '1.0.0' }) => {
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
    const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

    // Check if we need to show the scroll to top button
    React.useEffect(() => {
        const checkScrollPosition = () => {
            const scrollPosition = window.scrollY;
            setShowScrollTop(scrollPosition > 300);
        };

        window.addEventListener('scroll', checkScrollPosition);
        return () => window.removeEventListener('scroll', checkScrollPosition);
    }, []);

    const handleScrollTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const toggleSupportModal = () => {
        setShowSupportModal(!showSupportModal);
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 shadow-inner" dir="rtl">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div className="text-center md:text-right">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            سیستم مدیریت
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            سامانه جامع مدیریت و پشتیبانی سازمانی با قابلیت‌های پیشرفته برای بهبود کارایی سازمان شما
                        </p>
                        <div className="flex justify-center md:justify-end space-x-4">
                            <a href="#" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                <FontAwesomeIcon icon={faInstagram} size="lg" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 mx-4">
                                <FontAwesomeIcon icon={faTelegram} size="lg" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            لینک‌های مفید
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                                    راهنمای استفاده
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                                    سوالات متداول
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                                    قوانین و مقررات
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                                    درباره ما
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            تماس با ما
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center md:justify-start">
                                <FontAwesomeIcon icon={faPhone} className="text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300 mr-2">۰۲۱-۱۲۳۴۵۶۷۸</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300 mr-2">info@example.com</span>
                            </div>
                            <button
                                onClick={toggleSupportModal}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center mx-auto md:mx-0 mt-2"
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                                درخواست پشتیبانی
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="bg-gray-100 dark:bg-gray-900 py-3">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 md:mb-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCopyright} className="ml-1" />
                        <span>{currentYear} - تمامی حقوق محفوظ است</span>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center">
                        <span>نسخه {appVersion}</span>
                        <span className="mx-2">|</span>
                        <span className="flex items-center">
                            <span className="ml-1">ساخته شده با</span>
                            <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" />
                            <span>در ایران</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Scroll to top button */}
            {showScrollTop && (
                <button
                    onClick={handleScrollTop}
                    className="fixed bottom-6 left-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                    aria-label="Scroll to top"
                >
                    <FontAwesomeIcon icon={faChevronUp} />
                </button>
            )}

            {/* Support Modal */}
            {showSupportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            تماس با پشتیبانی
                        </h3>
                        <form>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="subject">
                                    موضوع
                                </label>
                                <input
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="subject"
                                    type="text"
                                    placeholder="موضوع پیام"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="message">
                                    پیام
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="message"
                                    rows={4}
                                    placeholder="متن پیام خود را اینجا بنویسید..."
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={toggleSupportModal}
                                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    انصراف
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    ارسال
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;