import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MyService, SubRuntime, SubStorage } from "../model/my_service";
interface ApiResponse<T> {
    data: T;
}

const baseURL = "http://localhost:3000";

const MyServices: React.FC = () => {
    const [services, setServices] = useState<MyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) throw new Error("Access token not found");

                const [storageRes, runtimeRes] = await Promise.all([
                    axios.post<ApiResponse<SubStorage[]>>(`${baseURL}/v2/sub-database/user`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.post<ApiResponse<SubRuntime[]>>(`${baseURL}/v2/sub-runtime/user`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const storageServices: MyService[] = (storageRes.data.data || []).map(item => ({
                    id: item.Id,
                    name: item.info_database.name,
                    category: item.info_database.service_type,
                    type: "storage",
                    specs: {
                        cpu: `${item.info_database.cpu} cores`,
                        ram: `${item.info_database.ram} MB`,
                        storage: `${item.info_database.storage} GB`,
                        version: item.info_database.version,
                        link: item.link,
                        port_one: item.port,
                    },
                    status: item.status ? "running" : "stopped"
                }));

                const runtimeServices: MyService[] = (runtimeRes.data.data || []).map(item => ({
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
            } catch (err: any) {
                setError(err.message || "Lỗi khi tải dịch vụ");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleManageService = (service: MyService) => {
        if (service.type === "storage") {
            navigate(`/storage/${service.id}/${service.name.toLowerCase()}`);
        } else {
            navigate(`/runtime/${service.id}`);
        }
    };

    if (loading) return <p className="text-center mt-20 text-gray-600">Loading...</p>;
    if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;
    if (services.length === 0) return <p className="text-center mt-20 text-gray-600">Bạn chưa đăng ký dịch vụ nào.</p>;

    return (
        <div className="p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(service => (
                <div key={service.id} className="bg-white-500 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium">
                            {service.type === "storage" ? "Storage" : "Runtime"}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{service.category}</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3 space-y-1">
                        <div>CPU: {service.specs.cpu}</div>
                        <div>RAM: {service.specs.ram}</div>
                        <div>Storage: {service.specs.storage}</div>
                        <div>Version: {service.specs.version}</div>
                        {service.type === "storage" && service.specs.link && <div>Link: {service.specs.link}</div>}
                        {service.type === "runtime" && service.specs.link_return && <div>Domain: {service.specs.link_return}</div>}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium">
                            {service.status === "running" ? "Đang chạy" : "Tạm dừng"}
                        </span>
                        <button onClick={() => handleManageService(service)} className="text-sm text-blue-600 hover:underline">
                            Quản lý
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyServices;
