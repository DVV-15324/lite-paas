import { useHookAuth } from "../../auth/hooks/authHooks.tsx";

export const ProfileUI = () => {
    const { profile } = useHookAuth();

    if (!profile)
        return <div className="text-gray-500">Đang tải thông tin người dùng...</div>;

    // Tạo initials từ tên
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="w-full xl:w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
            <div className="text-xl font-semibold text-gray-800 text-center">
                Thông tin người dùng
            </div>

            <div className="flex items-center justify-center w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
                    {initials}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <span className="capitalize font-medium">Name</span>
                    <span>{profile.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="capitalize font-medium">Email</span>
                    <span>{profile.email}</span>
                </div>
            </div>
        </div >
    );
};
