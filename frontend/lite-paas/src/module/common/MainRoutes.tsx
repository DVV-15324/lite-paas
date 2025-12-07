import { Outlet, Route, Routes } from "react-router-dom"
import { AuthLayout } from "../auth/components/AuthLayout"
import { RegisterUI } from "../auth/components/RegisterUI"
import { LoginUI } from "../auth/components/LoginUI"

import { PrivateComponent } from "./PrivateComponent"
import { PublicOnlyRoute } from "../auth/components/PublicOnlyRoute "
import { NotFound } from "./ErrorUI"
import { ProfileUI } from "../user/components/ProfileUI"
import MainLayout from "./MainLayout"

import BNCloudSidebar from "./SideBar"
import BNCloud from "./Home"
import RuntimeService from "./RuntimeUI"
import MyDBSR from "./MyDBSR"
import { PaymentForm } from "../payments/components/PaymentForm"
import { PaymentResult } from "../payments/components/PaymentResult"
import { ChangePasswordPage } from "../auth/components/ChangePassWord"
import { ResetPassword } from "./ResetPassword"



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
                            <BNCloud />
                        </MainLayout>
                    </PublicOnlyRoute>
                }
            />
            <Route
                element={
                    <MainLayout>
                        <Outlet />
                    </MainLayout>
                }
            >
                <Route path="/dashboard" element={<BNCloudSidebar />} />
                <Route path="/runtime/:id" element={<RuntimeService />} />
                <Route path="/storage/:id/:type" element={<MyDBSR />} />
                <Route path="/payment" element={<PaymentForm />} />
                <Route path="/payment/result" element={<PaymentResult />} />
            </Route>
            <Route
                element={
                    <PrivateComponent>
                        <MainLayout>
                            <Outlet />
                        </MainLayout>
                    </PrivateComponent>
                }
            >
                <Route path="profile" element={<ProfileUI />} />

            </Route>
            <Route
                element={
                    <PrivateComponent>
                        <AuthLayout>
                            <Outlet />
                        </AuthLayout>
                    </PrivateComponent>
                }
            >
                <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route >
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
        </Routes >
    );
};
