import { Navigate } from "react-router-dom";
import { useHookAuth } from "../hooks/authHooks";


export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { profile, loading } = useHookAuth();

    if (loading) return <div>Đang tải...</div>;

    if (profile) return <Navigate to="/" replace />;

    return <>{children}</>;
};
