import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import DashNavbar from "../DashNavbar/DashNavbar";
import { useState } from "react";
import i18n from "../../utils/i18n";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isRTL, setIsRTL] = useState(i18n.language === "ar");

    const handleLangToggle = () => {
        const newLang = isRTL ? "en" : "ar";
        i18n.changeLanguage(newLang);
        setIsRTL(!isRTL);
    };

    return (
        <div className="flex h-screen overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
            <div
                className={`
                    fixed inset-y-0 z-40 w-64 shadow-xl transition-transform duration-300 ease-in-out bg-[var(--primary-color)]
                    ${isRTL ? "right-0 border-l" : "left-0 border-r"}
                    ${sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}
                    lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:flex-shrink-0
                `}
            >
                <Sidebar closeSidebar={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashNavbar
                    isRTL={isRTL}
                    handleLangToggle={handleLangToggle}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 bg-[var(--background-color)] overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;