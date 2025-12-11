import React, { useState, useEffect } from "react";

interface StopServiceData {
    status: number;
}

interface ServiceSpecs {
    cpu: string;
    ram: string;
    storage: string;
    os?: string;
    version?: string;
}

interface ServiceItem {
    id: string;
    name: string;
    price: string;
    description: string;
    status: 'active' | 'pending' | 'inactive';
    specs?: ServiceSpecs;
    cpu?: number;
    ram?: number;
    storage?: number;
    version?: string;
    service_type?: string;
    created_at?: string;
    updated_at?: string;
    originalPrice?: number;
}

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    services: ServiceItem[];
}

const BNCloudServices: React.FC = () => {
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [detailService, setDetailService] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [useServiceLoading, setUseServiceLoading] = useState<boolean>(false);

    // Hàm format giá sang VND
    const formatPriceVND = (price: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Hàm xác định category dựa trên service_type
    const getCategoryInfo = (serviceType: string): { id: string; name: string; description: string } => {
        const categories: { [key: string]: { id: string; name: string; description: string } } = {
            'runtime': {
                id: 'runtime',
                name: 'Runtime Services',
                description: 'Các dịch vụ runtime và môi trường thực thi',
            },
            'storage': {
                id: 'storage',
                name: 'Storage Services',
                description: 'Các dịch vụ lưu trữ đối tượng và file',
            },
            'database': {
                id: 'database',
                name: 'Database Services',
                description: 'Các dịch vụ cơ sở dữ liệu',
            }
        };

        return categories[serviceType] || {
            id: 'other',
            name: 'Other Services',
            description: 'Các dịch vụ khác',
        };
    };

    // Hàm dừng dịch vụ
    const stopService = async (service: ServiceItem): Promise<boolean> => {
        try {
            const baseURL = "http://localhost:3000";
            const token = localStorage.getItem("access_token");

            if (!token) {
                throw new Error("Không tìm thấy token đăng nhập");
            }

            // Xác định endpoint dựa trên loại dịch vụ
            let endpoint = '';
            let serviceData = null;

            if (service.service_type === 'runtime') {
                endpoint = `${baseURL}/admin/stop-runtime/${service.id}`;
                serviceData = {
                    status: false
                };
            } else if (service.service_type === 'storage') {
                endpoint = `${baseURL}/admin/stop-storage/${service.id}`;
                serviceData = {
                    status: false
                };
            } else {
                throw new Error(`Loại dịch vụ ${service.service_type} không được hỗ trợ`);
            }

            console.log(`Stopping service ${service.id} at ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(serviceData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log("Service stopped successfully:", result);
            return true;
        } catch (err) {
            console.error('Error stopping service:', err);
            throw err;
        }
    };

    // Fetch services từ hai APIs: storage và runtime
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);

                // Định nghĩa hai API endpoints
                const apiEndpoints = [
                    { url: 'http://localhost:3000/v1/runtime/', type: 'runtime' },
                    { url: 'http://localhost:3000/v1/storage/', type: 'storage' }
                ];

                // Fetch data từ cả hai APIs
                const fetchPromises = apiEndpoints.map(async (endpoint) => {
                    try {
                        const token = localStorage.getItem("access_token");
                        const headers: HeadersInit = {};

                        if (token) {
                            headers['Authorization'] = `Bearer ${token}`;
                        }

                        const response = await fetch(endpoint.url, {
                            method: 'POST',
                            headers: headers
                        });

                        if (!response.ok) {
                            console.error(`HTTP error for ${endpoint.type}: ${response.status}`);
                            return [];
                        }

                        const data = await response.json();
                        console.log(`API Response for ${endpoint.type}:`, data);

                        // Xử lý dữ liệu trả về
                        if (data && data.data) {
                            // Nếu API trả về {data: [...]}
                            return Array.isArray(data.data)
                                ? data.data.map((service: any) => ({
                                    ...service,
                                    service_type: service.service_type || endpoint.type
                                }))
                                : [];
                        } else if (Array.isArray(data)) {
                            // Nếu API trả về trực tiếp mảng
                            return data.map((service: any) => ({
                                ...service,
                                service_type: service.service_type || endpoint.type
                            }));
                        } else {
                            console.warn(`Unexpected response format for ${endpoint.type}:`, data);
                            return [];
                        }
                    } catch (err) {
                        console.error(`Error fetching ${endpoint.type}:`, err);
                        return [];
                    }
                });

                // Chờ tất cả requests hoàn thành
                const results = await Promise.all(fetchPromises);

                // Gộp tất cả services lại
                const allServices = results.flat();

                console.log("Total services fetched:", allServices.length);

                if (allServices.length === 0) {
                    // Không throw error, chỉ hiển thị thông báo
                    console.warn('Không có dịch vụ nào được tìm thấy từ các API');
                    setServiceCategories([]);
                    setError(null);
                    return;
                }

                // Nhóm dịch vụ theo service_type từ API
                const servicesByType: { [key: string]: ServiceItem[] } = {};

                allServices.forEach((service: any) => {
                    const serviceType = service.service_type || 'other';

                    if (!servicesByType[serviceType]) {
                        servicesByType[serviceType] = [];
                    }

                    // Xác định trạng thái
                    let status: 'active' | 'pending' | 'inactive' = 'inactive';
                    if (service.status === true || service.status === 1 || service.status === 'active') {
                        status = 'active';
                    } else if (service.status === 'pending') {
                        status = 'pending';
                    }

                    const transformedService: ServiceItem = {
                        id: service.id || service._id || service.service_id || `temp-${Date.now()}-${Math.random()}`,
                        name: service.name || service.service_name || 'Unnamed Service',
                        price: formatPriceVND(service.price || service.cost || 0),
                        description: service.description || service.desc || 'No description available',
                        status: status,
                        cpu: service.cpu || 1,
                        ram: service.ram || 512,
                        storage: service.storage || 10,
                        version: service.version || "1.0",
                        service_type: service.service_type,
                        created_at: service.created_at || service.created_at,
                        updated_at: service.updated_at || service.updated_at,
                        originalPrice: service.price || service.cost || 0,
                        specs: {
                            cpu: `${service.cpu || 1} core${(service.cpu || 1) > 1 ? 's' : ''}`,
                            ram: `${service.ram || 512} MB`,
                            storage: `${service.storage || 10} GB`,
                            os: service.os || "Linux",
                            version: service.version || "1.0"
                        }
                    };

                    servicesByType[serviceType].push(transformedService);
                });

                // Tạo categories từ các nhóm service_type
                const transformedCategories: ServiceCategory[] = Object.keys(servicesByType).map(serviceType => {
                    const categoryInfo = getCategoryInfo(serviceType);
                    return {
                        ...categoryInfo,
                        services: servicesByType[serviceType]
                    };
                });

                setServiceCategories(transformedCategories);
                setError(null);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch services');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleUseServiceClick = (service: ServiceItem) => {
        setSelectedService(service);
    };

    const handleConfirm = async () => {
        if (selectedService) {
            try {
                setUseServiceLoading(true);

                // Gọi API dừng dịch vụ
                const success = await stopService(selectedService);

                if (success) {
                    alert(`✅ Đã dừng dịch vụ "${selectedService.name}" thành công!`);
                    // Refresh danh sách dịch vụ
                    window.location.reload();
                }
            } catch (err) {
                alert(`❌ Có lỗi xảy ra khi dừng dịch vụ: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setUseServiceLoading(false);
                setSelectedService(null);
            }
        }
    };

    const handleCancel = () => {
        setSelectedService(null);
    };

    const handleDetailClick = (service: ServiceItem) => {
        setDetailService(service);
    };

    const handleCloseDetail = () => {
        setDetailService(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Đang tải dịch vụ...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-red-600">Lỗi: {error}</div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Tất cả dịch vụ</h1>
                    <p className="text-lg text-gray-600">Khám phá toàn bộ dịch vụ đám mây của chúng tôi</p>
                </div>

                {serviceCategories.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Không có dịch vụ nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {serviceCategories.map((category) => (
                            <div key={category.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex items-center space-x-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 truncate">{category.name}</h3>
                                        <p className="text-gray-600 text-sm mt-1 truncate" title={category.description}>
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    {category.services.map((service) => (
                                        <div key={service.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800 truncate flex-1 mr-2" title={service.name}>
                                                    {service.name}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${service.status === 'active'
                                                    ? 'bg-green-100 text-green-600'
                                                    : service.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {service.status === 'active'
                                                        ? 'Hoạt động'
                                                        : service.status === 'pending'
                                                            ? 'Sắp ra mắt'
                                                            : 'Tạm ngưng'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={service.description}>
                                                {service.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-600 font-semibold truncate flex-1 mr-2" title={service.price}>
                                                    {service.price}
                                                </span>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleDetailClick(service)}
                                                        className="bg-blue-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => handleUseServiceClick(service)}
                                                        className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-900 transition-colors whitespace-nowrap"
                                                    >
                                                        Dừng dịch vụ
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal xác nhận dừng dịch vụ */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Xác nhận dừng dịch vụ</h2>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn dừng dịch vụ{" "}
                            <span className="font-semibold text-blue-600">{selectedService.name}</span>?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 text-left">
                            <div className="font-semibold mb-2">Thông tin dịch vụ:</div>
                            <div>• Tên dịch vụ: {selectedService.name}</div>
                            <div>• Loại dịch vụ: {selectedService.service_type}</div>
                            <div>• Trạng thái: {selectedService.status === 'active' ? 'Đang hoạt động' : 'Đã dừng'}</div>
                            <div className="text-red-600 font-semibold mt-2">⚠️ Lưu ý: Hành động này sẽ dừng dịch vụ ngay lập tức!</div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleCancel}
                                disabled={useServiceLoading}
                                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={useServiceLoading}
                                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {useServiceLoading ? (
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
            )}

            {/* Modal chi tiết dịch vụ */}
            {detailService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">{detailService.name}</h2>
                        <p className="text-gray-600 mb-4">{detailService.description}</p>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                            <div>CPU: <span className="font-semibold">{detailService.specs?.cpu}</span></div>
                            <div>RAM: <span className="font-semibold">{detailService.specs?.ram}</span></div>
                            <div>Storage: <span className="font-semibold">{detailService.specs?.storage}</span></div>
                            {detailService.service_type === 'database' && (
                                <div>Database Version: <span className="font-semibold">{detailService.version || "N/A"}</span></div>
                            )}
                            {detailService.service_type === 'runtime' && (
                                <div>Runtime Version: <span className="font-semibold">{detailService.version || "N/A"}</span></div>
                            )}
                            {detailService.service_type === 'storage' && (
                                <div>Storage Version: <span className="font-semibold">{detailService.version || "N/A"}</span></div>
                            )}
                            {!detailService.service_type && (
                                <div>Version: <span className="font-semibold">{detailService.version || "N/A"}</span></div>
                            )}
                            <div>Status: <span className="font-semibold">
                                {detailService.status === 'active' ? 'Hoạt động' :
                                    detailService.status === 'pending' ? 'Sắp ra mắt' : 'Tạm ngưng'}
                            </span></div>
                            <div>Giá: <span className="font-semibold text-green-600">{detailService.price}</span></div>
                            <div>Loại dịch vụ: <span className="font-semibold">
                                {detailService.service_type === 'runtime' ? 'Runtime' :
                                    detailService.service_type === 'database' ? 'Database' :
                                        detailService.service_type === 'storage' ? 'Storage' : 'Khác'}
                            </span></div>
                            <div>ID: <span className="font-mono text-xs">{detailService.id}</span></div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => handleUseServiceClick(detailService)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Dừng dịch vụ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default BNCloudServices;