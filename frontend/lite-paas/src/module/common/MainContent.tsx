import React from "react";
import BNCloudServices from "./AllService";
import SupportRequest from "./Support";

interface MenuItem {
    id: number;
    name: string;
    icon: string;
    badge?: string;
}

interface MainContentProps {
    activeMenu: number;
    menuItems: MenuItem[];
}

const MainContent: React.FC<MainContentProps> = ({ activeMenu, menuItems }) => {
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 h-full">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                    {menuItems.find((item) => item.id === activeMenu)?.name}
                </h1>

                <div className="text-gray-600">
                    {activeMenu === 1 ? (
                        <BNCloudServices />
                    ) : activeMenu === 2 ? (
                        <BNCloudServices />
                    ) : activeMenu === 4 ? (
                        <BNCloudServices />
                    ) : activeMenu === 5 ? (
                        <BNCloudServices />
                    ) : activeMenu === 3 ? (
                        <SupportRequest />
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            Chức năng “{menuItems.find((item) => item.id === activeMenu)?.name}” đang được phát triển 🚧
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MainContent;
