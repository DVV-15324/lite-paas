import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Interfaces cho Storage
interface SubStorage {
    Id: string;
    user_Id: string;
    service_Id: string;
    link: string;
    info_storage: {
        id: string;
        name: string;
        price: number;
        cpu: number;
        ram: number;
        storage: number;
        service_type: string;
        description: string;
        version: string;
        status: boolean;
        created_at: string;
        updated_at: string;
    };
    user: {
        id: string;
        name: string;
        phone: {
            String: string;
            Valid: boolean;
        };
        role: string;
        address: {
            String: string;
            Valid: boolean;
        };
        email: string;
        deleted_at: string;
        created_at: string;
        updated_at: string;
    };
    port_one: number;
    port_two: number;
    status: boolean;
    created_at: string;
    updated_at: string;
}

// Interfaces cho Runtime
interface SubRuntime {
    id: string;
    user_id: string;
    service_id: string;
    link_git: string;
    info_runtime: {
        id: string;
        name: string;
        price: number;
        cpu: number;
        ram: number;
        storage: number;
        description: string;
        version: string;
        status: boolean;
        created_at: string;
        updated_at: string;
    };
    user: {
        id: string;
        name: string;
        phone: {
            String: string;
            Valid: boolean;
        };
        role: string;
        address: {
            String: string;
            Valid: boolean;
        };
        email: string;
        deleted_at: string;
        created_at: string;
        updated_at: string;
    };
    link_return: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

// Interface thống nhất cho Service
interface MyService {
    id: string;
    name: string;
    category: string;
    type: "storage" | "runtime";
    specs: {
        cpu: string;
        ram: string;
        storage: string;
        version: string;
        link?: string;
        link_return?: string;
        link_git?: string;
        port_one?: number;
        port_two?: number;
    };
    status: "running" | "stopped" | "error";
}

const baseURL = 'http://localhost:3000';

const MyServices: React.FC = () => {
    const [services, setServices] = useState<MyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleManageService = (service: MyService) => {
        if (service.type === "storage") {
            const dbType = service.name.toLowerCase();
            navigate(`/storage/${service.id}/${dbType}`);
        } else if (service.type === "runtime") {
            navigate(`/runtime/${service.id}`);
        }
    };

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    throw new Error("Access token not found");
                }

                const [storageResponse, runtimeResponse] = await Promise.all([
                    fetch(`${baseURL}/v2/sub-storage/user`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch(`${baseURL}/v2/sub-runtime/user`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    })
                ]);

                if (!storageResponse.ok) {
                    throw new Error(`Storage API error: ${storageResponse.status}`);
                }

                if (!runtimeResponse.ok) {
                    throw new Error(`Runtime API error: ${runtimeResponse.status}`);
                }

                const storageData: SubStorage[] = await storageResponse.json();
                const runtimeData: SubRuntime[] = await runtimeResponse.json();

                const storageServices: MyService[] = storageData.map(item => ({
                    id: item.Id,
                    name: item.info_storage.name,
                    category: item.info_storage.service_type,
                    type: "storage",
                    specs: {
                        cpu: `${item.info_storage.cpu} cores`,
                        ram: `${item.info_storage.ram} MB`,
                        storage: `${item.info_storage.storage} GB`,
                        version: item.info_storage.version,
                        link: item.link,
                        port_one: item.port_one,
                        port_two: item.port_two
                    },
                    status: item.status ? "running" : "stopped"
                }));

                const runtimeServices: MyService[] = runtimeData.map(item => ({
                    id: item.id,
                    name: item.info_runtime.name,
                    category: "Runtime",
                    type: "runtime",
                    specs: {
                        cpu: `${item.info_runtime.cpu} cores`,
                        ram: `${item.info_runtime.ram} MB`,
                        storage: `${item.info_runtime.storage} GB`,
                        version: item.info_runtime.version,
                        link_return: item.link_return,
                        link_git: item.link_git
                    },
                    status: item.status ? "running" : "stopped"
                }));

                setServices([...storageServices, ...runtimeServices]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchAllServices();
    }, []);

    const renderSpecs = (service: MyService) => {
        return (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3 space-y-1">
                <div>CPU: {service.specs.cpu}</div>
                <div>RAM: {service.specs.ram}</div>
                <div>Storage: {service.specs.storage}</div>
                <div>Version: {service.specs.version}</div>

                {service.type === "storage" && (
                    <>
                        {service.specs.link && <div>Link: {service.specs.link}</div>}
                        {service.specs.port_one && <div>Port 1: {service.specs.port_one}</div>}
                        {service.specs.port_two && <div>Port 2: {service.specs.port_two}</div>}
                    </>
                )}

                {service.type === "runtime" && (
                    <>
                        {service.specs.link_return && <div>Domain: {service.specs.link_return}</div>}
                        {service.specs.link_git && <div>Git: {service.specs.link_git}</div>}
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="relative bg-gray-50 p-4 lg:p-8">
                <div className="w-full min-h-0 flex flex-col">
                    <p className="text-gray-600 text-center mt-20">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-gray-50 p-4 lg:p-8">
                <div className="w-full min-h-0 flex flex-col">
                    <p className="text-red-500 text-center mt-20">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="w-full min-h-0 flex flex-col">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dịch vụ của tôi</h1>

                {services.length === 0 ? (
                    <p className="text-gray-600 text-center mt-20">Bạn chưa đăng ký dịch vụ nào.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {service.name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.type === "storage"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-purple-100 text-purple-600"
                                        }`}>
                                        {service.type === "storage" ? "Storage" : "Runtime"}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mb-3">
                                    {service.category}
                                </p>

                                {renderSpecs(service)}

                                <div className="flex justify-between items-center">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === "running"
                                            ? "bg-green-100 text-green-600"
                                            : service.status === "stopped"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {service.status === "running"
                                            ? "Đang chạy"
                                            : service.status === "stopped"
                                                ? "Tạm dừng"
                                                : "Lỗi"}
                                    </span>
                                    <button
                                        onClick={() => handleManageService(service)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Quản lý
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyServices;