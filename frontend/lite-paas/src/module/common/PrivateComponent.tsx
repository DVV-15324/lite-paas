import React from "react";
import { useHookAuth } from "../auth/hooks/authHooks";
import { Navigate } from "react-router-dom";

interface PrivateComponentProps {
    children: React.ReactNode;
}

export const PrivateComponent = ({ children }: PrivateComponentProps) => {
    const { profile, loading } = useHookAuth();
    if (loading) {
        return <div className="w-screen h-screen bg-white">Đang tải...</div>;
    }
    if (!profile) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};
