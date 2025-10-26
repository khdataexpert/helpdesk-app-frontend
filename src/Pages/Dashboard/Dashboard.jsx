import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../../features/dashboardSlice";
import { TailSpin } from "react-loader-spinner";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {
    Users,
    FolderKanban,
    Ticket,
    FileText,
    Receipt,
    UsersRound,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const iconMap = {
    users: <Users className="w-8 h-8 text-white" />,
    projects: <FolderKanban className="w-8 h-8 text-white" />,
    tickets: <Ticket className="w-8 h-8 text-white" />,
    contracts: <FileText className="w-8 h-8 text-white" />,
    invoices: <Receipt className="w-8 h-8 text-white" />,
    teams: <UsersRound className="w-8 h-8 text-white" />,
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { user, stats, loading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    };

    useEffect(() => {
        const savedLang = localStorage.getItem("language") || "en";
        i18n.changeLanguage(savedLang);
        document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }, [i18n]);

    if (loading || !stats) {
        return (
            <div className="flex justify-center items-center ">
                <TailSpin height="100" width="100" color="var(--primary-color)" />
            </div>
        );
    }

    const chartData = {
        labels: [
            t("stats.users"),
            t("stats.projects"),
            t("stats.tickets"),
            t("stats.contracts"),
            t("stats.invoices"),
            t("stats.teams"),
        ],
        datasets: [
            {
                label: t("system_overview"),
                data: [
                    stats.users,
                    stats.projects,
                    stats.tickets,
                    stats.contracts,
                    stats.invoices,
                    stats.teams,
                ],
                backgroundColor: [
                    "#9ac1ffff",
                    "#60d2e7ff",
                    "#fae179ff",
                    "#74eca0ff",
                    "#ee8080ff",
                    "#ae8ef9ff",
                ],
                borderRadius: 15,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: t("system_overview"), color: "var(--text-color)" },
        },
        scales: {
            x: { ticks: { color: "var(--text-color)" } },
            y: { ticks: { color: "var(--text-color)" } },
        },
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-6">
            {/* Welcome Box */}
            <div className="bg-gradient-to-r from-orange-300 to-[#F7AA00] text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t("welcome", { name: user?.name })}</h1>
                    <p className="opacity-90">{t("email")}: {user?.email}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold">{t("role")}: {user?.roles?.join(", ")}</p>
                    <p className="text-sm opacity-90">
                        {t("permissions_count", { count: user?.permissions?.length })}
                    </p>
                </div>
            </div>

            {/*  Stats Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {Object.entries(stats).map(([key, value]) => (
                    <div
                        key={key}
                        className="group bg-gradient-to-br from-cyan-500 to-cyan-500 
                       text-white p-5 rounded-2xl shadow-md flex flex-col items-center justify-center 
                       hover:scale-105 transform transition-all duration-300 ease-in-out relative"
                    >
                        <div className="absolute top-3 left-3 opacity-20 group-hover:opacity-40 transition-all">
                            {iconMap[key]}
                        </div>
                        <h3 className="text-lg font-semibold capitalize z-10">{t(`stats.${key}`)}</h3>
                        <p className="text-4xl font-bold mt-2 z-10">{value}</p>
                    </div>
                ))}
            </div>

            {/*  Chart Section */}
            <div className="bg-[var(--background-color)] rounded-2xl shadow-lg p-6">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default Dashboard;
