import React from "react"

interface AuthLayoutProps {
    children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
            </div>
            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Center Content */}
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        {/* Card Container */}
                        <div className="relative">
                            {children}
                        </div>

                    </div>
                </main>


            </div>




        </div>
    );
};