import { useState, useEffect } from "react";
import { ServiceCategory, ServiceItem } from "../model/platform";
import { ApiFetchServices } from "../services/api";

export const useServices = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getCategoryInfo = (type: string) => {
        const map: Record<string, { id: string; name: string; description: string }> = {
            runtime: { id: "runtime", name: "Runtime Services", description: "Các dịch vụ runtime" },
            database: { id: "database", name: "Database Services", description: "Các dịch vụ cơ sở dữ liệu" },
        };

        return map[type] || map.other;
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError(null);

            try {
                const endpoints = [
                    { url: "/v1/runtime/get_all", type: "runtime" },
                    { url: "/v1/database/get_all", type: "database" },
                ];

                const results = await Promise.all(
                    endpoints.map(e => ApiFetchServices<any[]>(e.url))
                );

                // Chuyển đổi và làm phẳng dữ liệu
                const allServices: ServiceItem[] = results.flatMap((serviceArray, index) => {
                    if (!Array.isArray(serviceArray)) {
                        console.warn(`Endpoint ${endpoints[index].url} không trả về mảng:`, serviceArray);
                        return [];
                    }

                    return serviceArray.map((s: any) => ({
                        id: s.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                        name: s.name || "Unnamed Service",
                        price: Number(s.price) || 0,
                        description: s.description || "",
                        status: Boolean(s.status),
                        cpu: Number(s.cpu) || 0,
                        ram: Number(s.ram) || 0,
                        storage: Number(s.storage) || 0,
                        version: s.version || "",
                        service_type: s.service_type || endpoints[index].type || "other",
                        created_at: s.created_at || new Date().toISOString(),
                        updated_at: s.updated_at || new Date().toISOString(),
                        originalPrice: Number(s.price) || 0,
                        formattedPrice: new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        }).format(Number(s.price) || 0),
                        specs: {
                            cpu: `${s.cpu || 0} core${(s.cpu || 0) > 1 ? "s" : ""}`,
                            ram: `${s.ram || 0} MB`,
                            storage: `${s.storage || 0} GB`,
                            version: s.version || ""
                        }
                    }));
                });

                // Nhóm theo service_type
                const grouped: Record<string, ServiceItem[]> = {};
                allServices.forEach(s => {
                    const type = s.service_type || "other";
                    if (!grouped[type]) grouped[type] = [];
                    grouped[type].push(s);
                });

                // Tạo categories
                const cats: ServiceCategory[] = Object.keys(grouped).map(type => ({
                    ...getCategoryInfo(type),
                    services: grouped[type],
                }));

                setCategories(cats);
            } catch (err: any) {
                console.error("Error fetching services:", err);
                setError(err.message || "Lỗi khi tải dịch vụ");
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    return { categories, loading, error };
};