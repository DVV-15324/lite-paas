import React from "react";

import { Navigate } from "react-router-dom";
import { useHookAuth } from "../../module/auth/hooks/authHooks.tsx";


interface PrivateComponentProps {
    children: React.ReactNode;
    adminOnly?: boolean; // mới
}

export const PrivateComponent = ({ children, adminOnly }: PrivateComponentProps) => {
    const { profile, loading } = useHookAuth();

    if (loading) {
        return <div className="w-screen h-screen bg-white">Đang tải...</div>;
    }

    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && profile.role !== "admin") {
        return <Navigate to="/dashboard" replace />; // user không quyền vào admin
    }

    if (!adminOnly && profile.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />; // admin không vào page user
    }

    return <>{children}</>;
};
