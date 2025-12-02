import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface ServiceParams extends Record<string, string | undefined> {
    id: string;
    type: string;
}

interface ServiceData {
    Id: string;
    user_Id: string;
    service_Id: string;
    link_return: string;
    name_login: string;
    password_login: string;
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

interface MetricsData {
    MemoryUsed: string;
    CPUUsed: string;
    StorageUsed: string;
}

const MyDBSR: React.FC = () => {
    const { id } = useParams<ServiceParams>();
    const [isRunning, setIsRunning] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [serviceData, setServiceData] = useState<ServiceData | null>(null);
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [_, setMetricsLoading] = useState(true);
    const baseURL = "http://localhost:3000";

    // Hàm chuyển đổi đơn vị bộ nhớ
    const convertMemoryToMB = (memory: string): number => {
        if (memory.endsWith('Ki')) {
            return parseInt(memory) / 1024;
        } else if (memory.endsWith('Mi')) {
            return parseInt(memory);
        } else if (memory.endsWith('Gi')) {
            return parseInt(memory) * 1024;
        }
        return 0;
    };

    // Hàm chuyển đổi đơn vị CPU
    const convertCPUToCores = (cpu: string): number => {
        if (cpu.endsWith('n')) {
            return parseInt(cpu) / 1000000000; // nano cores to cores
        } else if (cpu.endsWith('u')) {
            return parseInt(cpu) / 1000000; // micro cores to cores
        } else if (cpu.endsWith('m')) {
            return parseInt(cpu) / 1000; // milli cores to cores
        }
        return parseFloat(cpu);
    };

    // Hàm chuyển đổi đơn vị storage
    const convertStorageToGB = (storage: string): number => {
        if (storage.endsWith('K')) {
            return parseInt(storage) / (1024 * 1024); // KB to GB
        } else if (storage.endsWith('M')) {
            return parseInt(storage) / 1024; // MB to GB
        } else if (storage.endsWith('G')) {
            return parseInt(storage);
        } else if (storage.endsWith('T')) {
            return parseInt(storage) * 1024;
        }
        return 0;
    };

    useEffect(() => {
        const fetchServiceDetail = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!id) {
                    console.error("No ID provided");
                    return;
                }

                const response = await fetch(`${baseURL}/v2/sub-storage/${id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setServiceData(data);
                    setIsRunning(data.status);

                    // Fetch metrics data sau khi có service data
                    if (data.service_Id && data.info_storage?.name) {
                        fetchMetricsData(id, data.info_storage.name, token);
                    }
                } else {
                    console.error("Failed to fetch service details");
                }
            } catch (error) {
                console.error("Error fetching service details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchMetricsData = async (serviceId: string, dbType: string, token: string | null) => {
            try {
                console.log(`Fetching metrics for serviceId: ${serviceId}, dbType: ${dbType}`);
                const response = await fetch(`${baseURL}/v2/mestrics/${serviceId}/${dbType}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                console.log(`Response status: ${response.status}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Metrics data response:", data);
                    setMetricsData(data.data);
                } else {
                    const errorText = await response.text();
                    console.error(`Failed to fetch metrics data: ${errorText}`);
                }
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setMetricsLoading(false);
            }
        };

        fetchServiceDetail();
    }, [id]);

    const connectionInfo = {
        host: serviceData?.link_return || "",
        port: serviceData?.port_one?.toString() || "",
        username: serviceData?.name_login || "",
        password: serviceData?.password_login || "",
    };

    // Tính toán phần trăm sử dụng
    const memoryUsedMB = metricsData ? convertMemoryToMB(metricsData.MemoryUsed) : 0;
    const memoryPercentage = serviceData ? (memoryUsedMB / serviceData.info_storage.ram) * 100 : 0;

    const cpuUsedCores = metricsData ? convertCPUToCores(metricsData.CPUUsed) : 0;
    const cpuPercentage = serviceData ? (cpuUsedCores / serviceData.info_storage.cpu) * 100 : 0;

    const storageUsedGB = metricsData ? convertStorageToGB(metricsData.StorageUsed) : 0;
    const storagePercentage = serviceData ? (storageUsedGB / serviceData.info_storage.storage) * 100 : 0;

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!serviceData) {
        return <div className="p-6">Service not found</div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Service Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {serviceData.info_storage.name.toUpperCase()} Database
                    </h1>
                    <p className="text-gray-600">
                        Cơ sở dữ liệu: {serviceData.info_storage.service_type}
                    </p>

                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${isRunning
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {isRunning ? "🟢 Đang chạy" : "⚪ Đã dừng"}
                    </button>
                </div>
            </div>

            {/* Resource Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specs Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông số sử dụng</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Loại database:</span>
                                <span className="font-medium">
                                    {serviceData.info_storage.name.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* CPU Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">CPU:</span>
                                <span className="font-medium">
                                    {cpuUsedCores.toFixed(4)} cores / {serviceData.info_storage.cpu} cores
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(cpuPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {cpuPercentage.toFixed(1)}% đã sử dụng
                            </div>
                        </div>

                        {/* RAM Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">RAM:</span>
                                <span className="font-medium">
                                    {memoryUsedMB.toFixed(0)} MB / {serviceData.info_storage.ram} MB
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {memoryPercentage.toFixed(1)}% đã sử dụng
                            </div>
                        </div>

                        {/* Storage Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Storage:</span>
                                <span className="font-medium">
                                    {storageUsedGB.toFixed(2)} GB / {serviceData.info_storage.storage} GB
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {storagePercentage.toFixed(1)}% đã sử dụng
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Version:</span>
                                <span className="font-medium">
                                    {serviceData.info_storage.version}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin kết nối</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={connectionInfo.host}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(connectionInfo.host)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={connectionInfo.port}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(connectionInfo.port)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đăng nhập</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={connectionInfo.username}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(connectionInfo.username)}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={connectionInfo.password}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                            />
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(connectionInfo.password)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection String Examples */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Connection Strings</h3>



                {/* General Database Connection String */}
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">General Connection String:</h4>
                    <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        {`Server=${connectionInfo.host},${connectionInfo.port};User Id=${connectionInfo.username};Password=${connectionInfo.password};`}
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(`Server=${connectionInfo.host},${connectionInfo.port};User Id=${connectionInfo.username};Password=${connectionInfo.password};`)}
                        className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                    >
                        Copy General Connection String
                    </button>
                </div>
            </div>



        </div>
    );
};

export default MyDBSR;