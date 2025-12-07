import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";

export type ResetPasswordType = {
    new_password: string;
};

// Hàm gọi API bằng fetch - ĐÃ SỬA LỖI
const ApiResetPassword = async (data: { token: string; new_password: string }) => {
    const API_BASE_URL = "http://localhost:3000";

    try {
        // Thêm token vào query string
        const url = `${API_BASE_URL}/v3/auth/reset_password?token=${encodeURIComponent(data.token)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_password: data.new_password,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Lấy thông báo lỗi từ response
            const errorMessage = responseData.message ||
                responseData.error ||
                `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return responseData;
    } catch (error: any) {
        console.error("Reset password API error:", error);
        throw error;
    }
};

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    // Kiểm tra token khi component mount
    useEffect(() => {
        if (!token) {
            setIsTokenValid(false);
            enqueueSnackbar("Link reset mật khẩu không hợp lệ hoặc đã hết hạn", { variant: "error" });
            setTimeout(() => navigate("/login"), 3000);
        } else {
            setIsTokenValid(true);
        }
    }, [token, navigate]);

    const handlePasswordChange = async () => {
        if (!token) {
            enqueueSnackbar("Token không hợp lệ", { variant: "error" });
            return;
        }

        setSubmitAttempted(true);

        // Reset errors
        setPasswordErrors({
            newPassword: "",
            confirmPassword: "",
        });

        // Validation
        let hasError = false;
        const newErrors = {
            newPassword: "",
            confirmPassword: "",
        };

        if (!passwordData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
            hasError = true;
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
            hasError = true;
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
            hasError = true;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            hasError = true;
        }

        if (hasError) {
            setPasswordErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Gọi API reset password với token và mật khẩu mới
            const result = await ApiResetPassword({
                token,
                new_password: passwordData.newPassword,
            });

            // Nếu API trả về thông điệp thành công
            enqueueSnackbar(result.message || "Đặt lại mật khẩu thành công!", {
                variant: "success",
            });

            setTimeout(() => navigate("/login"), 2000);


        } catch (error: any) {
            console.error("Reset password error:", error);
            const errorMessage = error.message || "Lỗi khi đặt lại mật khẩu";
            enqueueSnackbar(errorMessage, { variant: "error" });

            // Kiểm tra xem có phải lỗi token không
            if (error.message?.toLowerCase().includes("token") ||
                error.message?.toLowerCase().includes("hết hạn") ||
                error.message?.toLowerCase().includes("không hợp lệ") ||
                error.message?.toLowerCase().includes("expired") ||
                error.message?.toLowerCase().includes("invalid")) {
                setTimeout(() => {
                    navigate("/forgot-password");
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/login");
    };

    // Helper function để kiểm tra xem có nên hiển thị lỗi không
    const shouldShowError = (fieldName: 'newPassword' | 'confirmPassword') => {
        return submitAttempted && passwordErrors[fieldName];
    };

    // Hiển thị thông báo nếu token không hợp lệ
    if (isTokenValid === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-24 w-auto"
                            />
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Link không hợp lệ
                            </h2>
                            <p className="text-gray-300 mb-6">
                                Link reset mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
                            </p>
                            <button
                                onClick={() => navigate("/forgot-password")}
                                className="w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 transition-all duration-300"
                            >
                                Yêu cầu link mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị loading khi đang kiểm tra token
    if (isTokenValid === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Đang kiểm tra liên kết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
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
                        Đặt lại mật khẩu
                    </h1>
                    <p className="text-gray-400">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                {/* Form đổi mật khẩu */}
                <div className="rounded-xl border border-white/10 shadow-xl p-6 space-y-8 backdrop-blur-sm bg-white/5">
                    {/* New Password Field */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Lock className="h-5 w-5 text-blue-400" />
                            </div>
                            <label className="block text-sm font-medium text-gray-300">
                                Mật khẩu mới
                            </label>
                        </div>
                        <div className="relative group">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                    ...prev,
                                    newPassword: e.target.value
                                }))}
                                className={`w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border ${shouldShowError('newPassword')
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                    } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {shouldShowError('newPassword') && (
                            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                {passwordErrors.newPassword}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Lock className="h-5 w-5 text-purple-400" />
                            </div>
                            <label className="block text-sm font-medium text-gray-300">
                                Xác nhận mật khẩu mới
                            </label>
                        </div>
                        <div className="relative group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                }))}
                                className={`w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border ${shouldShowError('confirmPassword')
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                    } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {shouldShowError('confirmPassword') && (
                            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                {passwordErrors.confirmPassword}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 space-y-4">
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={isLoading}
                            className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 group ${isLoading
                                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span>Xác nhận đổi mật khẩu</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};