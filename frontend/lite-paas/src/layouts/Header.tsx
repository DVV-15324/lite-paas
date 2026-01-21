import { Menu, MenuItem, MenuButton, MenuItems } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useHookAuth } from "../module/auth/hooks/authHooks.tsx";


const HeaderMain = () => {
    const navigate = useNavigate();
    const { handleOut, profile } = useHookAuth();

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            handleOut();
        }
    };

    const initials = profile?.name
        ? profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "";

    return (
        <header className="bg-gray-800 text-white top-0 z-50">
            <div className="container mx-auto px-8 flex justify-between items-center py-4">
                <div className="cursor-pointer" onClick={() => navigate("/")}>
                    <h1 className="text-3xl font-bold">LitePaas</h1>
                </div>

                {profile ? (
                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center space-x-2 ">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {initials}
                            </div>
                            <span className="hidden md:block">▼</span>
                        </MenuButton>

                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow border border-gray-200">
                            <MenuItem as="button" className="w-full px-4 py-2 text-blue-600" onClick={() => navigate("/profile")}>
                                Thông tin tài khoản
                            </MenuItem>
                            <MenuItem as="button" className="w-full px-4 py-2 text-blue-600" onClick={handleLogout}>
                                Đăng xuất
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg text-white font-medium"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    );
};

export default HeaderMain;
