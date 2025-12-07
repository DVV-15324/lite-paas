import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useHookAuth } from "../hooks/authHooks";
import { RegisterSchema } from "../model/schema";
import { User, Mail, Lock, Key, Shield, Sparkles, Eye, EyeOff } from "lucide-react";

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

    const methods = useForm<RegisterFormData>({
        resolver: yupResolver(RegisterSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const {
        handleSubmit,
        register,
        formState: { errors, isValid }
    } = methods;

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await handleRegister(data);
        } catch (error) {
            console.error("Register error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">

            <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-24 w-auto"
                    />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Create Account
                </h1>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <label className="block text-sm font-medium text-gray-300">
                            Full Name
                        </label>
                    </div>
                    <div className="relative group">

                        <input
                            type="text"
                            {...register("name")}
                            className={`w-full pl-4 pr-4 py-4 rounded-xl bg-white/5 border ${errors.name
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                            placeholder="John Doe"
                            autoComplete="name"
                        />
                    </div>
                    {errors.name && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {errors.name.message}
                        </div>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <Mail className="h-5 w-5 text-purple-400" />
                        </div>
                        <label className="block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                    </div>
                    <div className="relative group">

                        <input
                            type="email"
                            {...register("email")}
                            className={`w-full pl-4 pr-4 py-4 rounded-xl bg-white/5 border ${errors.email
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                            placeholder="name@example.com"
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {errors.email.message}
                        </div>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <Lock className="h-5 w-5 text-green-400" />
                        </div>
                        <label className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                    </div>
                    <div className="relative group">

                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className={`w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border ${errors.password
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                                } text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm`}
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                    {errors.password && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {errors.password.message}
                        </div>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <Lock className="h-5 w-5 text-yellow-400" />
                        </div>
                        <label className="block text-sm font-medium text-gray-300">
                            Confirm Password
                        </label>
                    </div>
                    <div className="relative group">

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword")}
                            className={`w-full  pl-4 pr-12 py-4 rounded-xl bg-white/5 border ${errors.confirmPassword
                                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-white/10 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
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
                    {errors.confirmPassword && (
                        <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {errors.confirmPassword.message}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 group ${isLoading || !isValid
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-5 h-5">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <span>Create Account</span>
                        </>
                    )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-6 border-t border-white/10">
                    <p className="text-gray-400">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Sign in
                        </a>
                    </p>
                </div>


            </form>
        </div>
    );
}