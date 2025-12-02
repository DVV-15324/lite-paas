import { useState } from "react";

const HeaderMain = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const accountInfo = {
        username: "dinvv",
        fullName: "Đinh Viết Vũ Duy Hoàng",
        status: "active",
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            console.log("Đăng xuất");
        }
    };

    const displayName =
        accountInfo.fullName.length > 14
            ? `${accountInfo.fullName.slice(0, 12)}...`
            : accountInfo.fullName;

    const initials = accountInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div>
                            <img src="/logo.png" alt="" className="w-15 h-12" />
                        </div>
                        <h1 className="text-2xl font-bold">BNCloud</h1>
                    </div>

                    {/* User Section */}
                    <div className="relative">
                        <div
                            className={`
                                flex items-center space-x-3 
                                cursor-pointer transition-all duration-300 
                                border border-white/20 
                                rounded-full px-4 py-2 
                                bg-white/10 hover:bg-white/15 backdrop-blur-sm
                                md:flex
                                ${isDropdownOpen ? "bg-white/20" : ""}
                                max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:py-0
                            `}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {initials}
                            </div>

                            {/* Hide name + arrow on mobile */}
                            <div className="hidden md:flex items-center space-x-2">
                                <span
                                    className="font-medium max-w-[120px] truncate"
                                    title={accountInfo.fullName}
                                >
                                    {displayName}
                                </span>
                                <span
                                    className={`transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    ▼
                                </span>
                            </div>
                        </div>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
                                <div className="p-2">
                                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                        <span className="text-lg">👤</span>
                                        <span className="text-gray-700">Thông tin tài khoản</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <div
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer transition-colors text-red-500"
                                        onClick={handleLogout}
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span>Đăng xuất</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderMain;
