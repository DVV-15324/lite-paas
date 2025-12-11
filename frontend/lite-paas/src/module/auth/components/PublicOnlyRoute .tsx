import { Navigate } from "react-router-dom";
import { useHookAuth } from "../hooks/authHooks";


export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile, loading } = useHookAuth();

    if (loading) return <div>Đang tải...</div>;

    if (profile?.role == "admin") return <Navigate to="/admin/dashboard" replace />;
    if (profile?.role == "user") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};
