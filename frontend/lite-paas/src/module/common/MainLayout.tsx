import React from "react";
import HeaderMain from "./Header";
import FooterMain from "./Footer";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <HeaderMain />
            <main className="flex-1 w-full overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <FooterMain />
        </div>
    );
};

export default MainLayout;
