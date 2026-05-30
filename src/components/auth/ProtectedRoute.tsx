import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Basic auth check using localStorage
    const isAdminAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
