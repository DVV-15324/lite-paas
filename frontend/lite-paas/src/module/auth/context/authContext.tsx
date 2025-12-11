import React, { createContext, useCallback, useEffect, useState } from "react";
import { ForgotPasswordType, LoginType, ProfileType, RegisterType, ResponseLoginType } from "../model/auth";
import { useNavigate, ErrorResponse } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios, { AxiosError } from "axios";
import CircularProgress from '@mui/material/CircularProgress';
import { ApiForgetPassword, ApiLogin, ApiLoginGoogle, ApiProfile, ApiRegister } from "../services/api";
import { Response } from "../../common/model";
import { TokenResponse } from "@react-oauth/google";

const ErrorHandle = (error: AxiosError | Error) => {
    if (axios.isAxiosError(error)) {
        return { message: error.response?.data.error, error: error.response?.data.message };
    }
    return { message: error.message || "UnKnown Error" };
};

export const DefaultLoading = () => (
    <CircularProgress className="flex justify-center items-center" />
);
type AuthContextType = {
    profile: ProfileType | null;
    loading: boolean;
    handleLogin: (data: LoginType) => Promise<void>;
    handleRegister: (data: RegisterType) => Promise<void>;
    handleForgotPassword: (data: ForgotPasswordType) => Promise<void>;
    handleProfile: () => Promise<ProfileType | null>; // <-- thay đổi ở đây
    handleCredentialResponse: (response: TokenResponse) => Promise<void>;
    handleOut: () => void;
};


export const AuthContext = createContext<AuthContextType>({
    profile: null,
    loading: true,
    handleLogin: async () => { },
    handleRegister: async () => { },
    handleForgotPassword: async () => { },
    handleProfile: async () => null,
    handleCredentialResponse: async () => { },
    handleOut: () => { },
});

interface AuthContextProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthContextProps) => {
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleProfile = useCallback(async (): Promise<ProfileType | null> => {
        try {
            const profile = await ApiProfile<Response<ProfileType>>();
            setProfile(profile.data);
            setLoading(false);
            return profile.data;  // trả về profile
        } catch (error) {
            setProfile(null);
            setLoading(false);
            localStorage.removeItem("access_token");
            const err = ErrorHandle(error as Error | AxiosError<ErrorResponse>);
            enqueueSnackbar(err.message, { variant: "error" });
            return null;
        }
    }, []);


    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (token) {
                    await handleProfile();
                }
            } catch (error) {
                const err = ErrorHandle(error as Error | AxiosError<ErrorResponse>);
                enqueueSnackbar(err.message, { variant: "error" });
            } finally {
                setLoading(false);
            }
        })();
    }, [handleProfile, enqueueSnackbar]);

    const handleLogin = async (data: LoginType) => {
        try {
            const tokenRes = await ApiLogin<Response<ResponseLoginType>>(data);
            const accessToken = tokenRes?.data?.access_token.token;
            if (!accessToken) throw new Error("Token từ server không hợp lệ");

            localStorage.setItem("access_token", accessToken);
            enqueueSnackbar("Đăng nhập thành công!", { variant: "success" });

            // Lấy profile trực tiếp
            const userProfile = await handleProfile();
            if (userProfile?.role === "user") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            const err = ErrorHandle(error as Error | AxiosError<ErrorResponse>);
            enqueueSnackbar(err.message, { variant: "error" });
        }
    };

    const handleRegister = async (data: RegisterType) => {
        try {
            await ApiRegister<Response<boolean>>(data);
            navigate("/");
        } catch (error) {
            const err = ErrorHandle(error as Error | AxiosError<ErrorResponse>);
            enqueueSnackbar(err.message, { variant: "error" });
        }
    };

    const handleForgotPassword = async (data: ForgotPasswordType) => {
        try {
            await ApiForgetPassword<Response<boolean>>(data);
            navigate("/");
        } catch (error) {
            const err = ErrorHandle(error as Error | AxiosError<ErrorResponse>);
            enqueueSnackbar(err.message, { variant: "error" });
        }
    };

    const handleOut = () => {
        setProfile(null);
        localStorage.removeItem("access_token");
        window.location.replace("/");
    };

    const handleCredentialResponse = async (response: TokenResponse) => {
        try {
            const res = await ApiLoginGoogle<Response<ResponseLoginType>>(response.access_token);
            localStorage.setItem("access_token", res.data.access_token.token);
            enqueueSnackbar("Đăng nhập bằng Google thành công!", { variant: "success" });

            const profileData = await handleProfile();

            if (profileData?.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            const error = ErrorHandle(err as AxiosError);
            enqueueSnackbar(error.message || "Đã xảy ra lỗi", { variant: "error" });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                profile,
                loading,
                handleLogin,
                handleRegister,
                handleProfile,
                handleCredentialResponse,
                handleOut,
                handleForgotPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
