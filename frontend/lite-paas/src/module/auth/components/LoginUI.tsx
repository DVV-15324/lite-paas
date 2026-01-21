import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginSchema } from "../model/schema";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useHookAuth } from "../hooks/authHooks.tsx";
import { LoginType } from "../model/auth.ts";


export function LoginUI() {
    const { handleLogin } = useHookAuth();
    const [showP, setShowP] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigator = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginType>({
        resolver: yupResolver(LoginSchema),
        defaultValues: { email: "", password: "" }
    });

    const handleLoginSubmit = async (data: LoginType) => {
        setIsLoading(true);
        try {
            await handleLogin(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded">
            <h1 className="text-xl font-bold mb-4 text-center">Đăng nhập</h1>
            <form onSubmit={handleSubmit(handleLoginSubmit)}>
                {/* Email field */}
                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        className={`w-full px-3 py-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showP ? "text" : "password"}
                            {...register("password")}
                            className={`w-full px-3 py-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowP(!showP)}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            {showP ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 mb-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <button
                    type="button"
                    onClick={() => navigator("/register")}
                    className="text-blue-600 hover:underline"
                >
                    Đăng kí
                </button>
            </form>
        </div>
    );
}