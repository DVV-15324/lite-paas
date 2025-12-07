import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHookAuth } from "../auth/hooks/authHooks";

const HeaderMain = () => {
    const navigate = useNavigate();
    const { handleOut, profile } = useHookAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null); // <-- gán type

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            handleOut();
            setIsDropdownOpen(false);
            console.log("Đăng xuất");
        }
    };

    const displayName = profile?.name
        ? profile.name.length > 14
            ? `${profile.name.slice(0, 12)}...`
            : profile.name
        : "";

    const initials = profile?.name
        ? profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "";

    return (
        <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="ml-4 flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
                        <img src="/logo.png" alt="logo" className="w-15 h-12" />
                        <h1 className="text-2xl font-bold">LitePaas</h1>
                    </div>

                    {/* User Section */}
                    <div className="relative" ref={dropdownRef}>
                        {profile ? (
                            <>
                                {/* User Avatar Button */}
                                <div
                                    className={`
                                        flex items-center space-x-3 
                                        cursor-pointer transition-all duration-200
                                        border border-transparent
                                        rounded-full px-3 py-2
                                        hover:bg-white/10 active:bg-white/15
                                        ${isDropdownOpen
                                            ? "bg-white/15 border-white/30"
                                            : "bg-white/5 hover:border-white/10"
                                        }
                                        max-md:px-2 max-md:py-1.5
                                    `}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {initials}
                                    </div>

                                    <div className="hidden md:flex items-center space-x-2">
                                        <span
                                            className="font-medium max-w-[120px] truncate"
                                            title={profile.name}
                                        >
                                            {displayName}
                                        </span>
                                        <span className={`inline-block transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        {/* Arrow indicator */}
                                        <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>

                                        {/* Dropdown header */}
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate" title={profile.name}>
                                                        {profile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate" title={profile.email}>
                                                        {profile.email || "Không có email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dropdown items */}
                                        <div className="py-2">
                                            <div
                                                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                                                onClick={() => {
                                                    navigate("/profile");
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                    <span className="text-blue-600 text-lg">👤</span>
                                                </div>
                                                <span className="text-gray-700 font-medium">Thông tin tài khoản</span>
                                            </div>



                                            <div className="border-t border-gray-200 my-2"></div>

                                            <div
                                                className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors duration-150 group"
                                                onClick={handleLogout}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                    <span className="text-red-600 text-lg">🚪</span>
                                                </div>
                                                <span className="text-red-600 font-medium">Đăng xuất</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderMain;