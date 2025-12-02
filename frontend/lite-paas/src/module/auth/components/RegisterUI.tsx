
import { useHookAuth } from "../hooks/authHooks";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterSchema } from "../model/schema";

export function RegisterUI() {
    const { handleRegister } = useHookAuth();
    const methods = useForm({
        resolver: yupResolver(RegisterSchema)
    })
    const { handleSubmit, register, formState: { errors } } = methods
    return (
        <form onSubmit={handleSubmit(handleRegister)}
            className="flex flex-col bg-white p-6 xl:p-12 rounded sm:w-sm xl:w-xl md:w-md sm:w-sm lg:w-lg xs:w-xs"
        >
            <img src="/logo.png" alt="Logo" className="mb-xl" />


            <div className="xl:mb-4">
                <label className="block xl:mb-2" htmlFor="name"> Name</label>
                <input
                    className={`border rounded w-full p-1 xl:px-3 xl:py-2 ${errors.name ? "border-gray-300" : "border-red-900"}`}
                    type="text"
                    id="name"
                    placeholder="Name"
                    {...register("name")}
                />
                {errors.name &&
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                }
            </div>


            <div className="xl:mb-4">
                <label className="block   mb-2" htmlFor="email">Email</label>
                <input
                    className={`border rounded w-full px-3 py-2 ${errors.email ? "boder-red-900" : "border-gray-300"}`}
                    type="email"
                    id="email"
                    placeholder="Email"
                    {...register("email")}
                />

                {errors.email &&
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                }
            </div>

            <div className="mb-4">
                <label className="block mb-2" htmlFor="password">Password</label>
                <input
                    className={`border rounded w-full px-3 py-2 ${errors.password ? "boder-red-900" : "border-gray-300"}`}
                    type="password"
                    id="password"
                    placeholder="Password"
                    {...register("password")}
                />
                {errors.password &&
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                }
            </div>

            <button
                type="submit"
                className="bg-red-900 text-white p-1 xl:px-4 xl:py-2 rounded w-full"
            >
                Register
            </button>

            <p className="mt-4 text-center text-sm">
                Đã có tài khoản? <a className="text-blue-600 underline" href="/">Đăng nhập</a>
            </p>
        </form>
    );
}
