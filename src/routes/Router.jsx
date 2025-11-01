import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../Pages/Login/Login";
import Dashboard from "../Pages/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../Components/NotFound/NotFound";
import DashboardLayout from "../Components/DashboardLayout/DashboradLayout";
import Users from "../Pages/Users/Users";
import Roles from "../Pages/Roles/Roles";
import UsersData from "../Pages/Dashboard/UsersData/UsersData";
import Companies from "../Pages/Companies/Companies";
import Teams from "../Pages/Teams/Teams";
import TeamsData from "../Pages/Dashboard/TeamsData/TeamsData";
import Projects from "../Pages/Projects/Projects"
import ProjectsData from "../Pages/Dashboard/ProjectsData/ProjectsData";
import Tickets from "../Pages/Tickets/Tickets";
import TicketsData from "../Pages/Dashboard/TicketsData/TicketsData";
import Contracts from "../Pages/Contracts/Contracts";
import ContractsData from "../Pages/Dashboard/ContractsData/ContractsData";
import Invoices from "../Pages/Invoices/Invoices";
import InvoicesData from "../Pages/Dashboard/InvoicesData/InvoicesData";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                element: <DashboardLayout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "users", element: <Users /> },
                    { path: "users/:id", element: <UsersData /> },
                    { path: "companies", element: <Companies /> },
                    { path: "teams", element: <Teams /> },
                    { path: "/teams/:id", element: <TeamsData /> },
                    { path: "projects", element: <Projects/> },
                    { path: "projects/:id", element: <ProjectsData /> },
                    { path: "tickets", element: <Tickets/> },
                    { path: "tickets/:id", element: <TicketsData /> },
                    { path: "contracts", element: <Contracts/> },
                    { path: "contracts/:id", element: <ContractsData /> },
                    { path: "invoices", element: <Invoices/> },
                    { path: "invoices/:id", element: <InvoicesData /> },
                    { path: "roles", element: <Roles /> },
                ],
            },

        ],
    },
    { path: "*", element: <NotFound /> },
]);

export default router;