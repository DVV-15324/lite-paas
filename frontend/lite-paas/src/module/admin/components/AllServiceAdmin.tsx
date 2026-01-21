import React, { useEffect, useState } from "react";

type ServiceStatus = "active" | "inactive" | "pending";
type ServiceType = "runtime" | "database";

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    status: ServiceStatus;
    service_type: ServiceType;
    cpu?: number;
    ram?: number;
    storage?: number;
    version?: string;
}

const baseURL = "http://localhost:3000";

const LiteServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [selected, setSelected] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("access_token");

    const fetchServices = async () => {
        setLoading(true);

        const endpoints = [
            { url: "/v1/runtime/get_all", type: "runtime" },
            { url: "/v1/database/get_all", type: "database" },
        ];

        const results = await Promise.all(
            endpoints.map(async (e) => {
                const res = await fetch(baseURL + e.url, {
                    method: "POST",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                const json = await res.json();
                return (json.data || []).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || "",
                    price: s.price || 0,
                    status: s.status ? "active" : "inactive",
                    service_type: e.type,
                    cpu: s.cpu,
                    ram: s.ram,
                    storage: s.storage,
                    version: s.version,
                }));
            })
        );

        setServices(results.flat());
        setLoading(false);
    };
    useEffect(() => {
        fetchServices();
    }, []);

    if (loading) return <p className="p-4">Đang tải dịch vụ...</p>;

    return (
        <div className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                    <div
                        key={s.id}
                        className="border rounded-lg p-4 space-y-2 bg-white"
                    >
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{s.name}</h3>
                            <span
                                className={`text-xs ${s.status === "active"
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                            >
                                {s.status}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600">{s.description}</p>

                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-600">
                                {s.price.toLocaleString("vi-VN")} ₫
                            </span>

                            <div className="space-x-2">
                                <button
                                    className="text-sm underline"
                                    onClick={() => setSelected(s)}
                                >
                                    Chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-3">
                        <h2 className="text-xl font-bold">{selected.name}</h2>
                        <p>{selected.description}</p>

                        <ul className="text-sm text-gray-700">
                            <li>CPU: {selected.cpu || "-"}</li>
                            <li>RAM: {selected.ram || "-"} MB</li>
                            <li>Storage: {selected.storage || "-"} GB</li>
                            <li>Version: {selected.version || "-"}</li>
                            <li>Type: {selected.service_type}</li>
                        </ul>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={() => setSelected(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiteServices;
