import { useState } from "react";
import { Key, Eye, EyeOff, Lock } from "lucide-react";
import { useHookAuth } from "../hooks/authHooks";
import { enqueueSnackbar } from "notistack";
import { ApiChangePassword } from "../services/api";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export const ChangePasswordPage = () => {
    const navigate = useNavigate();
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
    const { handleOut } = useHookAuth();
    const handlePasswordChange = async () => {
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
            await ApiChangePassword({
                new_password: passwordData.newPassword,
            });

            enqueueSnackbar("Đổi mật khẩu thành công!", { variant: "success" });

            handleOut();

            // Reset form và điều hướng về profile
            setPasswordData({

                newPassword: "",
                confirmPassword: "",
            });
            setSubmitAttempted(false);
            navigate("/profile");
        } catch (error) {
            const err = error as AxiosError;
            enqueueSnackbar(err.message || "Lỗi khi đổi mật khẩu", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/profile");
    };

    // Helper function để kiểm tra xem có nên hiển thị lỗi không
    const shouldShowError = (fieldName: 'newPassword' | 'confirmPassword') => {
        return submitAttempted && passwordErrors[fieldName];
    };

    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header với nút back */}
                <div className="mb-8">


                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div>
                            <h1 className="text-white text-3xl font-bold text-gray-900">Đổi mật khẩu</h1>

                        </div>
                    </div>
                </div>

                {/* Form đổi mật khẩu */}
                <div className="rounded-xl border border-gray-200 shadow-sm p-6 space-y-8">
                    {/* Current Password Field */}


                    {/* New Password Field */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700">
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
                                className={`text-white w-full pl-4 pr-12 py-3 rounded-lg border ${shouldShowError('newPassword')
                                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    } outline-none transition-all duration-300`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {shouldShowError('newPassword') && (
                            <div className="flex items-center text-red-500 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                {passwordErrors.newPassword}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Lock className="h-5 w-5 text-green-600" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700">
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
                                className={`text-white w-full pl-4 pr-12 py-3 rounded-lg border ${shouldShowError('confirmPassword')
                                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    } outline-none transition-all duration-300`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {shouldShowError('confirmPassword') && (
                            <div className="flex items-center text-red-500 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
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
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
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
                            className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300"
                        >
                            Hủy bỏ
                        </button>
                    </div>



                </div>
            </div>
        </div>
    );
};