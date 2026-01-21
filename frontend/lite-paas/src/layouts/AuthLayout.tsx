import React from "react"

interface AuthLayoutProps {
    children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="flex flex-col h-screen bg-gray-900 justify-center">
            <div >
                {children}
            </div>
        </div >
    );
};