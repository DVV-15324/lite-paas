import { Outlet, Route, Routes } from "react-router-dom"
import { PublicOnlyRoute } from "../shared/public/PublicOnlyRoute ";
import { RegisterUI } from "../module/auth/components/RegisterUI";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginUI } from "../module/auth/components/LoginUI";
import MainLayout from "../layouts/MainLayout";
import Home from "../shared/home/Home";
import { PrivateComponent } from "../shared/private/PrivateComponent";
import { PaymentResult } from "../module/payments/components/PaymentResult";
import LitePaasSidebar from "../shared/sidebar/SideBar";
import LitePaasSidebarAdmin from "../shared/sidebar/SideBarAdmin";
import { ProfileUI } from "../module/user/components/ProfileUI";
import MyDBSR from "../module/platform_sub/components/MyDBSR";
import RuntimeService from "../module/platform_sub/components/RuntimeUI";
import { PaymentForm } from "../module/payments/components/PaymentForm";


export const MainRoutes = () => {
    return (
        <Routes>
            <Route
                path="/register"
                element={
                    <PublicOnlyRoute>
                        <AuthLayout>
                            <RegisterUI />
                        </AuthLayout>
                    </PublicOnlyRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <AuthLayout>
                            <LoginUI />
                        </AuthLayout>
                    </PublicOnlyRoute>
                }
            />
            <Route
                path="/"
                element={
                    <PublicOnlyRoute>
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    </PublicOnlyRoute>
                }
            />
            <Route
                element={
                    <PrivateComponent>
                        <AuthLayout>
                            <Outlet />
                        </AuthLayout>
                    </PrivateComponent>
                }
            >
            </Route >
            <Route
                element={
                    <PrivateComponent>
                        <MainLayout><Outlet /></MainLayout>
                    </PrivateComponent>
                }
            >
                <Route path="/dashboard" element={<LitePaasSidebar />} />
                <Route path="/runtime/:id" element={<RuntimeService />} />
                <Route path="/storage/:id/:type" element={<MyDBSR />} />
                <Route path="/payment" element={<PaymentForm />} />
                <Route path="/payment/result" element={<PaymentResult />} />
                <Route path="/profile" element={<ProfileUI />} />
            </Route>
            <Route
                path="/admin"
                element={
                    <PrivateComponent adminOnly>
                        <MainLayout><Outlet /></MainLayout>
                    </PrivateComponent>
                }
            >
                <Route path="profile" element={<ProfileUI />} />
                <Route path="dashboard" element={<LitePaasSidebarAdmin />} />
            </Route>
        </Routes >
    );
};
