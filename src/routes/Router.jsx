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
                    { path: "teams", element: <p className="p-8">Teams Page</p> },
                    { path: "projects", element: <p className="p-8">Projects Page</p> },
                    { path: "tickets", element: <p className="p-8">Tickets Page</p> },
                    { path: "contracts", element: <p className="p-8">Contracts Page</p> },
                    { path: "invoices", element: <p className="p-8">Invoices Page</p> },
                    { path: "roles", element: <Roles /> },
                ],
            },

        ],
    },
    { path: "*", element: <NotFound /> },
]);

export default router;