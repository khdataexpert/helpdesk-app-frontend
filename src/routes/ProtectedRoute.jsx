import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ requiredPermission }) => {
    const { token, user } = useSelector((state) => state.auth);
    const location = useLocation(); 

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 p-6">
                <div className="text-3xl font-bold text-red-700">Access Denied</div>
                <p className="mt-2 text-gray-700">
                    You do not have the required permission to view this resource.
                </p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
