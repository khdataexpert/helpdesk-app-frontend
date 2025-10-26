import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { Globe } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import userImg from "../../assests/login.png";

const DashNavbar = ({ toggleSidebar }) => {
    const { user } = useSelector((state) => state.auth);
    const { i18n } = useTranslation();

    const [isRTL, setIsRTL] = useState(i18n.language === "ar");

    // ✅ Load saved language preference on mount
    useEffect(() => {
        const savedLang = localStorage.getItem("language") || "en";
        i18n.changeLanguage(savedLang);
        document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
        setIsRTL(savedLang === "ar");
    }, [i18n]);

    // ✅ Toggle language and persist it
    const handleLangToggle = () => {
        const newLang = isRTL ? "en" : "ar";
        i18n.changeLanguage(newLang);
        localStorage.setItem("language", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        setIsRTL(!isRTL);
    };

    return (
        <header className="bg-[var(--background-color)] shadow-md px-4 lg:px-8 h-16 flex justify-between items-center sticky top-0 z-30">
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden text-[var(--primary-color)] text-xl focus:outline-none"
            >
                <FaBars />
            </button>

            <h1 className="text-xl font-semibold text-[var(--primary-color)] hidden sm:block">
                {isRTL ? "لوحة التحكم" : "Dashboard"}
            </h1>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLangToggle}
                    className="flex items-center gap-2 px-3 py-1.5 border rounded-full border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-all duration-200"
                    title={isRTL ? "Switch to English" : "التبديل للعربية"}
                >
                    <Globe size={18} />
                    <span className="text-sm font-medium">{isRTL ? "EN" : "AR"}</span>
                </button>

                <div className="text-right">
                    <p className="text-[var(--primary-color)] font-semibold leading-tight">
                        {user?.name || "User"}
                    </p>
                    <p className="text-gray-500 text-sm capitalize">
                        {user?.role || "Member"}
                    </p>
                </div>

                <img
                    src={user?.imgUrl || userImg}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border border-gray-200"
                />
            </div>
        </header>
    );
};

export default DashNavbar;
