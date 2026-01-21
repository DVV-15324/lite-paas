import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterSchema } from "../model/schema";
import { Eye, EyeOff } from "lucide-react";
import { useHookAuth } from "../hooks/authHooks.tsx";
import { useNavigate } from "react-router-dom";

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export function RegisterUI() {
    const { handleRegister } = useHookAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();

    const methods = useForm<RegisterFormData>({
        resolver: yupResolver(RegisterSchema),

        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const { handleSubmit, register, formState: { errors, isValid } } = methods;

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await handleRegister(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-xl font-bold mb-4 text-center">Đăng kí</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* name*/}
                <div className="mb-4">
                    <label className="block text-sm">Ho va ten</label>
                    <input
                        type="text"
                        {...register("name")}
                        placeholder="vu"
                        className={`w-full px-3 py-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* email*/}
                <div className="mb-4">
                    <label className="block mb-1 text-sm">Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        placeholder="vu@gmail.com"
                        className={`w-full px-3 py-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* mat khau */}
                <div className="mb-4">
                    <label className="block mb-1 text-sm">Mat khau</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                {/* xac nhan */}
                <div className="mb-6">
                    <label className="block mb-1 text-sm">Xac nhan lai mat khau</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword")}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 border rounded ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className="w-full py-2 mb-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {isLoading ? "Đăng kí..." : "Đăng kí"}
                </button>

                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-gray-500">
                        Bạn có tài khoản?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:underline"
                        >
                            Đăng nhập
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}