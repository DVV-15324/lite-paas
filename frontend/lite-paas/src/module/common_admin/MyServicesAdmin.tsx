import React, { useEffect, useState } from "react";

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
    created_at: string;
    updated_at: string;
    user_name: string;
    user_email: string;
    originalData?: SubStorage | SubRuntime; // Lưu dữ liệu gốc để có thể dùng API
}

const baseURL = 'http://localhost:3000';

const MyServicesAdmin: React.FC = () => {
    const [services, setServices] = useState<MyService[]>([]);
    const [filteredServices, setFilteredServices] = useState<MyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stoppingServiceId, setStoppingServiceId] = useState<string | null>(null);
    const [showStopModal, setShowStopModal] = useState(false);
    const [serviceToStop, setServiceToStop] = useState<MyService | null>(null);

    // State cho filter
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    throw new Error("Access token not found");
                }

                const [storageResponse, runtimeResponse] = await Promise.all([
                    fetch(`${baseURL}/admin/sub-storage/all`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch(`${baseURL}/admin/sub-runtime/all`, {
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
                    status: item.status ? "running" : "stopped",
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    user_name: item.user?.name || "Unknown",
                    user_email: item.user?.email || "",
                    originalData: item
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
                    status: item.status ? "running" : "stopped",
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    user_name: item.user?.name || "Unknown",
                    user_email: item.user?.email || "",
                    originalData: item
                }));

                const allServices = [...storageServices, ...runtimeServices];
                setServices(allServices);
                setFilteredServices(allServices);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchAllServices();
    }, []);

    // Hàm lọc dịch vụ
    useEffect(() => {
        let result = [...services];

        // Filter theo khoảng thời gian (created_at)
        if (startDate) {
            const start = new Date(startDate);
            result = result.filter(service => {
                const serviceDate = new Date(service.created_at);
                return serviceDate >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            result = result.filter(service => {
                const serviceDate = new Date(service.created_at);
                return serviceDate <= end;
            });
        }

        // Filter theo loại dịch vụ
        if (typeFilter !== "all") {
            result = result.filter(service => service.type === typeFilter);
        }

        // Filter theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter(service => service.status === statusFilter);
        }

        // Filter theo từ khóa tìm kiếm
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(service =>
                service.name.toLowerCase().includes(term) ||
                service.user_name.toLowerCase().includes(term) ||
                service.user_email.toLowerCase().includes(term) ||
                service.category.toLowerCase().includes(term)
            );
        }

        // Sắp xếp
        result.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            switch (sortBy) {
                case "newest":
                    return dateB - dateA;
                case "oldest":
                    return dateA - dateB;
                case "name_asc":
                    return a.name.localeCompare(b.name);
                case "name_desc":
                    return b.name.localeCompare(a.name);
                default:
                    return dateB - dateA;
            }
        });

        setFilteredServices(result);
    }, [services, startDate, endDate, typeFilter, statusFilter, searchTerm, sortBy]);

    // Reset filter
    const resetFilter = () => {
        setStartDate("");
        setEndDate("");
        setTypeFilter("all");
        setStatusFilter("all");
        setSearchTerm("");
        setSortBy("newest");
    };

    // Check if any filter is active
    const isFilterActive = () => {
        return startDate !== "" || endDate !== "" || typeFilter !== "all" ||
            statusFilter !== "all" || searchTerm !== "" || sortBy !== "newest";
    };

    // Hàm format date
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    // Hàm dừng dịch vụ
    const handleStopService = async (serviceId: string) => {
        try {
            setStoppingServiceId(serviceId);
            const token = localStorage.getItem("access_token");
            if (!token) {
                throw new Error("Access token not found");
            }

            // Xác định endpoint dựa trên loại dịch vụ
            const service = services.find(s => s.id === serviceId);
            if (!service) {
                throw new Error("Service not found");
            }
            let appName = "";

            const serviceData = service.originalData as SubRuntime;
            appName = `${serviceData.user.name}-${serviceData.id}`
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9-]/g, '');

            let endpoint = '';
            endpoint = `${baseURL}/admin/stop/apps/${service.type == "runtime" ? "user" : "db"}/logs/${appName}`;


            // Gọi API dừng dịch vụ
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token} `,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} `);
            }

            // Cập nhật trạng thái local
            setServices(prevServices =>
                prevServices.map(s =>
                    s.id === serviceId ? { ...s, status: "stopped" } : s
                )
            );

            alert("✅ Đã dừng dịch vụ thành công!");
        } catch (err) {
            console.error("Error stopping service:", err);
            alert(`❌ Không thể dừng dịch vụ: ${err instanceof Error ? err.message : "Unknown error"} `);
        } finally {
            setStoppingServiceId(null);
            setShowStopModal(false);
            setServiceToStop(null);
        }
    };

    // Xác nhận dừng dịch vụ
    const confirmStopService = (service: MyService) => {
        setServiceToStop(service);
        setShowStopModal(true);
    };

    // Xử lý khi click dừng dịch vụ
    const handleStopClick = (service: MyService) => {
        // Hiển thị confirm dialog trước
        const confirmed = window.confirm(
            `Bạn có chắc muốn dừng dịch vụ "${service.name}" của người dùng ?\n\n` +
            `Dịch vụ này sẽ ngừng hoạt động và không thể truy cập.`
        );

        if (confirmed) {
            confirmStopService(service);
        }
    };

    const renderSpecs = (service: MyService) => {
        return (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3 space-y-1">
                <div>CPU: {service.specs.cpu}</div>
                <div>RAM: {service.specs.ram}</div>
                <div>Storage: {service.specs.storage}</div>
                <div>Version: {service.specs.version}</div>
                <div className="text-xs text-gray-500">
                    Ngày tạo: {formatDate(service.created_at)}
                </div>

                {service.type === "storage" && (
                    <>
                        {service.specs.link && (
                            <div className="truncate">
                                Link: <span className="font-mono text-xs">{service.specs.link}</span>
                            </div>
                        )}
                        {service.specs.port_one && <div>Port 1: {service.specs.port_one}</div>}
                        {service.specs.port_two && <div>Port 2: {service.specs.port_two}</div>}
                    </>
                )}

                {service.type === "runtime" && (
                    <>
                        {service.specs.link_return && (
                            <div className="truncate">
                                Domain: <span className="font-mono text-xs">{service.specs.link_return}</span>
                            </div>
                        )}
                        {service.specs.link_git && (
                            <div className="truncate">
                                Git: <span className="font-mono text-xs">{service.specs.link_git}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // Hàm đếm số lượng dịch vụ theo trạng thái
    const getServiceStats = () => {
        const running = filteredServices.filter(s => s.status === "running").length;
        const stopped = filteredServices.filter(s => s.status === "stopped").length;
        const error = filteredServices.filter(s => s.status === "error").length;
        const total = filteredServices.length;

        return { running, stopped, error, total };
    };

    const stats = getServiceStats();

    if (loading) {
        return (
            <div className="relative bg-gray-50 p-4 lg:p-8">
                <div className="w-full min-h-0 flex flex-col">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600 text-center mt-4">Đang tải danh sách dịch vụ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-gray-50 p-4 lg:p-8">
                <div className="w-full min-h-0 flex flex-col">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto mt-8">
                        <div className="text-red-600 text-center mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2 text-center">Đã xảy ra lỗi</h3>
                        <p className="text-red-600 text-center">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="w-full min-h-0 flex flex-col">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dịch vụ của người dùng</h1>

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Bộ lọc</h3>
                        {isFilterActive() && (
                            <button
                                onClick={resetFilter}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tên dịch vụ, người dùng..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại dịch vụ
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="storage">Storage</option>
                                <option value="runtime">Runtime</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="running">Đang chạy</option>
                                <option value="stopped">Đã dừng</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sắp xếp
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="name_asc">Tên A-Z</option>
                                <option value="name_desc">Tên Z-A</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Summary */}
                    {isFilterActive() && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {startDate && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Từ: {new Date(startDate).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                                {endDate && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Đến: {new Date(endDate).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                                {typeFilter !== "all" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Loại: {typeFilter === "storage" ? "Storage" : "Runtime"}
                                    </span>
                                )}
                                {statusFilter !== "all" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Trạng thái: {statusFilter === "running" ? "Đang chạy" : "Đã dừng"}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Tìm kiếm: "{searchTerm}"
                                    </span>
                                )}
                                {sortBy !== "newest" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        Sắp xếp: {
                                            sortBy === "oldest" ? "Cũ nhất" :
                                                sortBy === "name_asc" ? "Tên A-Z" :
                                                    "Tên Z-A"
                                        }
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Đang chạy</div>
                                <div className="text-2xl font-bold text-green-600">{stats.running}</div>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Đã dừng</div>
                                <div className="text-2xl font-bold text-yellow-600">{stats.stopped}</div>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Tổng dịch vụ</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Người dùng</div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {Array.from(new Set(filteredServices.map(s => s.user_email))).length}
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-4">
                            {isFilterActive() ? "Không tìm thấy dịch vụ nào phù hợp với bộ lọc" : "Hiện tại không có dịch vụ nào."}
                        </p>
                        {isFilterActive() && (
                            <button
                                onClick={resetFilter}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div key={service.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                            {service.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-gray-500">
                                                Người dùng: {service.user_name}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${service.type === "storage"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-purple-100 text-purple-600"
                                        } `}>
                                        {service.type === "storage" ? "Storage" : "Runtime"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(service.created_at)}
                                </div>

                                {renderSpecs(service)}

                                <div className="flex justify-between items-center mt-4">
                                    <span
                                        className={`px - 2 py - 1 rounded - full text - xs font - medium ${service.status === "running"
                                            ? "bg-green-100 text-green-600"
                                            : service.status === "stopped"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                            } `}
                                    >
                                        {service.status === "running"
                                            ? "Đang chạy"
                                            : service.status === "stopped"
                                                ? "Đã dừng"
                                                : "Lỗi"}
                                    </span>

                                    {service.status === "running" && (
                                        <button
                                            onClick={() => handleStopClick(service)}
                                            disabled={stoppingServiceId === service.id}
                                            className={`px - 3 py - 1 rounded text - sm font - medium whitespace - nowrap ${stoppingServiceId === service.id
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-red-50 text-red-600 hover:bg-red-100"
                                                } `}
                                        >
                                            {stoppingServiceId === service.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                'Dừng dịch vụ'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal xác nhận dừng dịch vụ */}
            {showStopModal && serviceToStop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.77-.833-2.54 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Xác nhận dừng dịch vụ</h3>
                            <p className="text-gray-600 mb-4 text-center">
                                Bạn có chắc muốn dừng dịch vụ <span className="font-semibold">{serviceToStop.name}</span>?
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-700">
                                    <strong>⚠️ Lưu ý:</strong> Dịch vụ sẽ ngừng hoạt động và người dùng không thể truy cập cho đến khi được khởi động lại.
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowStopModal(false);
                                        setServiceToStop(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleStopService(serviceToStop.id)}
                                    disabled={stoppingServiceId === serviceToStop.id}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center"
                                >
                                    {stoppingServiceId === serviceToStop.id ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận dừng'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyServicesAdmin;