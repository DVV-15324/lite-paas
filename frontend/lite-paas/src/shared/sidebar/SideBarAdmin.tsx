import React, { useState } from "react";
import UserManagementAdmin from "../../module/admin/components/UserManagementAdmin";

import BNCloudServices from "../../module/admin/components/AllServiceAdmin";
import { InvoiceAdmin } from "../../module/admin/components/InvoiceAdmin";



interface MenuItem {
    id: number;
    name: string;
    badge?: string;
}

const LitePaasSidebarAdmin: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<number>(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
        { id: 1, name: "Quản lí tất cả dịch vụ" },
        { id: 2, name: "Quản lí hóa đơn" },
        { id: 3, name: "Quản lí người dùng" },
    ];

    return (
        <div className="w-full min-h-0 flex flex-col relative">
            {/* Header (Mobile) */}
            <header className="lg:hidden p-4 flex-shrink-0 z-50">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <span className="text-xl">☰</span>
                    </button>

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
                <main className="flex-1 min-h-0 p-4 lg:p-8 relative">
                    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 h-full flex flex-col">


                        {/* Content area với scroll */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {activeMenu === 1 ? (
                                <BNCloudServices />

                            ) : activeMenu === 2 ? (
                                <InvoiceAdmin />

                            ) : activeMenu === 3 ? (
                                <UserManagementAdmin />

                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    Chức năng "{menuItems.find((item) => item.id === activeMenu)?.name}" đang được phát triển 🚧
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Overlay khi sidebar mở (mobile) - Sửa với transparency hoàn toàn */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 lg:hidden"
                />
            )}
        </div>
    );
};

export default LitePaasSidebarAdmin;