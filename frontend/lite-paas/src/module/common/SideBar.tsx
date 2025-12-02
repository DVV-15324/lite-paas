


import React, { useState } from "react";
import BNCloudServices from "./AllService";
import SupportRequest from "./Support";
import Invoice from "./Invoice";
import HistoryInvoice from "./History";
import MyServices from "./MyServices";

interface MenuItem {
    id: number;
    name: string;
    badge?: string;
}

const BNCloudSidebar: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<number>(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
        { id: 1, name: "Tất cả dịch vụ" },
        { id: 2, name: "Dịch vụ của tôi" },
        { id: 3, name: "Yêu cầu hỗ trợ" },
        { id: 4, name: "Hóa đơn" },
        { id: 5, name: "Lịch sử hóa đơn" },
    ];

    return (
        <div className="w-full min-h-0 flex flex-col">
            {/* Header (Mobile) */}
            <header className="lg:hidden bg-white shadow-sm p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <span className="text-xl">☰</span>
                    </button>
                    <h1 className="font-bold text-lg text-gray-800">BNCloud</h1>
                </div>
            </header>

            {/* Layout */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
                    w-80 bg-white shadow-xl transition-transform duration-300
                    flex-shrink-0 flex flex-col h-full`}
                >
                    {/* Close Button (Mobile) */}
                    <div className="lg:hidden flex justify-end p-4 flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>

                    {/* Menu với scroll */}
                    <nav className="flex-1 min-h-0 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            setActiveMenu(item.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeMenu === item.id
                                            ? "bg-gray-800 text-white shadow-lg"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                            }`}
                                    >

                                        <span className="font-medium">{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content với scroll */}
                <main className="flex-1 min-h-0 p-4 lg:p-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 h-full flex flex-col">
                        {/* Header cố định */}
                        <div className="flex-shrink-0 mb-6">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                {menuItems.find((item) => item.id === activeMenu)?.name}
                            </h1>
                        </div>

                        {/* Content area với scroll */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {activeMenu === 1 ? (
                                <BNCloudServices />
                            ) : activeMenu === 2 ? (
                                <MyServices />
                            ) : activeMenu === 4 ? (
                                <Invoice />
                            ) : activeMenu === 5 ? (
                                <HistoryInvoice />
                            ) : activeMenu === 3 ? (
                                <SupportRequest />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    Chức năng "{menuItems.find((item) => item.id === activeMenu)?.name}" đang được phát triển 🚧
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Overlay khi sidebar mở (mobile) */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 lg:hidden"
                />
            )}
        </div>
    );
};

export default BNCloudSidebar;