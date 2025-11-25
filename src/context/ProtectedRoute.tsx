import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/" />;
    if (user && roles && !roles.includes(user.role)) {
        if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" />
        else if (user.role === "TEACHER") return <Navigate to="/teacher/dashboard" />
        else if (user.role === "PARENT") return <Navigate to="/parent/dashboard" />
        return <Navigate to="/" />;
    }
    return children;
} 

export default ProtectedRoute;