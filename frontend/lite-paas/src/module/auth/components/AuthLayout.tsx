import React from "react"



interface AuthLayoutProps {
    children: React.ReactNode
}
export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="bg-blue-100">
            <div className="w-screen h-screen flex items-center justify-center">
                {children}
            </div>
        </div >
    );
};

