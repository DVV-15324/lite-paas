import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useHookAuth } from "../hooks/authHooks";
import GoogleLoginButton from "./GoogleLoginButton";
import { LoginSchema, ForgotPasswordSchema } from "../model/schema";
import { Eye, EyeOff, Mail, Lock, LogIn, Key, ArrowLeft } from "lucide-react";

interface LoginFormData {
    email: string;
    password: string;
}

interface ForgotPasswordFormData {
    email: string;
}

export function LoginUI() {
    const { handleLogin, handleForgotPassword } = useHookAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isForgotPasswordMode, setIsForgotPasswordMode] = React.useState(false);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = React.useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    // Chỉ cần một form cho cả login và forgot password
    const loginMethods = useForm<LoginFormData>({
        resolver: yupResolver(LoginSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const forgotPasswordMethods = useForm<ForgotPasswordFormData>({
        resolver: yupResolver(ForgotPasswordSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            email: ""
        }
    });

    const {
        handleSubmit: handleLoginSubmit,
        register: loginRegister,
        formState: { errors: loginErrors },
        getValues: getLoginValues,

    } = loginMethods;

    const {
        handleSubmit: handleForgotPasswordSubmit,
        register: forgotPasswordRegister,
        formState: { errors: forgotPasswordErrors },
        reset: resetForgotPasswordForm,
        setValue: setForgotPasswordValue
    } = forgotPasswordMethods;

    const onSubmitLogin = async (data: LoginFormData) => {
        setSubmitAttempted(true);
        setIsLoading(true);
        try {
            await handleLogin(data);
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
        setSubmitAttempted(true);
        setIsLoading(true);
        setForgotPasswordMessage({ type: null, message: '' });

        try {
            // SỬA LỖI Ở ĐÂY: Thêm email parameter
            await handleForgotPassword(data);
            setForgotPasswordMessage({
                type: 'success',
                message: 'Nếu tài khoản tồn tại với email này, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong thời gian sớm nhất.'
            });
            resetForgotPasswordForm();
        } catch (error: any) {
            console.error("Forgot password error:", error);
            setForgotPasswordMessage({
                type: 'error',
                message: error?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        // Lấy email từ form login và set vào form forgot password
        const loginEmail = getLoginValues("email");
        setForgotPasswordValue("email", loginEmail);
        setIsForgotPasswordMode(true);
        setSubmitAttempted(false);
        setForgotPasswordMessage({ type: null, message: '' });
    };

    const handleBackToLogin = () => {
        setIsForgotPasswordMode(false);
        setForgotPasswordMessage({ type: null, message: '' });
        setSubmitAttempted(false);
    };

    const shouldShowError = (fieldName: keyof LoginFormData | keyof ForgotPasswordFormData, errors: any) => {
        return submitAttempted && errors[fieldName];
    };

    // Form Forgot Password
    if (isForgotPasswordMode) {
        return (
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-24 w-auto"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                        Quên mật khẩu
                    </h1>
                    <p className="text-gray-400">
                        Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                    </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit(onSubmitForgotPassword)} className="space-y-8">
                    {/* Email Field - Sử dụng luôn email từ form login */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Mail className="h-5 w-5 text-blue-400" />
                            </div>
                            <label className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                        </div>
                        <div className="relative group">
                            <input
                                type="email"
                                {...forgotPasswordRegister("email")}
                                className={`w-full pl-4 pr-4 py-4 rounded-xl bg-white/5 border ${shouldShowError("email", forgotPasswordErrors)
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                    } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                                placeholder="name@example.com"
                                autoComplete="email"
                            />
                        </div>
                        {shouldShowError("email", forgotPasswordErrors) && (
                            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                {forgotPasswordErrors.email?.message}
                            </div>
                        )}
                    </div>

                    {/* Success/Error Message */}
                    {forgotPasswordMessage.type && (
                        <div className={`flex items-center text-sm px-4 py-3 rounded-lg border ${forgotPasswordMessage.type === 'success'
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                            <div className={`w-2 h-2 rounded-full mr-3 ${forgotPasswordMessage.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            {forgotPasswordMessage.message}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 group ${isLoading
                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Đang gửi...</span>
                            </>
                        ) : (
                            <>
                                <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                <span>Gửi yêu cầu đặt lại</span>
                            </>
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center pt-6">
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Quay lại đăng nhập
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Original Login Form
    return (
        <div className="w-full">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-24 w-auto"
                    />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                    Welcome To LitePaas
                </h1>
            </div>

            <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <label className="block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="email"
                            {...loginRegister("email")}
                            className={`w-full pl-4 pr-4 py-4 rounded-xl bg-white/5 border ${shouldShowError("email", loginErrors)
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                            placeholder="name@example.com"
                            autoComplete="email"
                        />
                    </div>
                    {shouldShowError("email", loginErrors) && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {loginErrors.email?.message}
                        </div>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Lock className="h-5 w-5 text-purple-400" />
                            </div>
                            <label className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={handleForgotPasswordClick}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...loginRegister("password")}
                            className={`w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border ${shouldShowError("password", loginErrors)
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {shouldShowError("password", loginErrors) && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {loginErrors.password?.message}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 group ${isLoading
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        <>
                            <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            <span>Đăng nhập</span>
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-gray-900 text-gray-500 text-sm"></span>
                    </div>
                </div>

                {/* Social Login */}
                <div>
                    <GoogleLoginButton />
                </div>

                {/* Register Link */}
                <div className="text-center pt-6 border-t border-white/10">
                    <p className="text-gray-400">
                        New to Platform?{" "}
                        <a
                            href="/register"
                            className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Create account
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}