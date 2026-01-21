import React from "react";
import HeaderMain from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <HeaderMain />
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
