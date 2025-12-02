import React, { useState, useEffect } from "react";

interface CreateInvoiceItem {
    service_id: string;
    service_type: string;
    amount: number;
    status: string;
    payment_method: string;
    due_date: string;
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
    originalPrice?: number; // Thêm trường để lưu giá gốc
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
    const [registerLoading, setRegisterLoading] = useState<boolean>(false);

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

    // Hàm tạo hóa đơn
    const createInvoice = async (service: ServiceItem): Promise<boolean> => {
        try {
            const baseURL = "http://localhost:3000"; // Thay bằng baseURL thực tế

            // Tính due_date: 30 ngày từ bây giờ
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            const invoiceData: CreateInvoiceItem = {
                service_id: service.id,
                service_type: service.service_type || 'runtime',
                amount: service.originalPrice || 0, // Sử dụng giá gốc
                status: "pending",
                payment_method: "credit_card",
                due_date: dueDate.toISOString()
            };
            const token = localStorage.getItem("access_token")
            const response = await fetch(`${baseURL}/v2/invoice/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify(invoiceData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Invoice created:", result);
            return true;
        } catch (err) {
            console.error('Error creating invoice:', err);
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
                        const response = await fetch(endpoint.url, {
                            method: 'POST'
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for ${endpoint.type}`);
                        }

                        const data = await response.json();
                        console.log(`API Response for ${endpoint.type}:`, data);

                        // Trả về dữ liệu với service_type từ API, nếu không có thì dùng type từ endpoint
                        return Array.isArray(data)
                            ? data.map(service => ({
                                ...service,
                                service_type: service.service_type || endpoint.type
                            }))
                            : [];
                    } catch (err) {
                        console.error(`Error fetching ${endpoint.type}:`, err);
                        return []; // Trả về mảng rỗng nếu có lỗi
                    }
                });

                // Chờ tất cả requests hoàn thành
                const results = await Promise.all(fetchPromises);

                // Gộp tất cả services lại
                const allServices = results.flat();

                if (allServices.length === 0) {
                    throw new Error('Không có dịch vụ nào được tìm thấy từ các API');
                }

                // Nhóm dịch vụ theo service_type từ API
                const servicesByType: { [key: string]: ServiceItem[] } = {};

                allServices.forEach((service: any) => {
                    const serviceType = service.service_type || 'other';

                    if (!servicesByType[serviceType]) {
                        servicesByType[serviceType] = [];
                    }

                    const transformedService: ServiceItem = {
                        id: service.id,
                        name: service.name,
                        price: formatPriceVND(service.price),
                        description: service.description,
                        status: service.status ? 'active' : 'inactive',
                        cpu: service.cpu,
                        ram: service.ram,
                        storage: service.storage,
                        version: service.version,
                        service_type: service.service_type,
                        created_at: service.created_at,
                        updated_at: service.updated_at,
                        originalPrice: service.price, // Lưu giá gốc để tạo hóa đơn
                        specs: {
                            cpu: `${service.cpu} core${service.cpu > 1 ? 's' : ''}`,
                            ram: `${service.ram} MB`,
                            storage: `${service.storage} GB`,
                            os: service.version || "Linux",
                            version: service.version
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
            } catch (err) {
                console.error('Error fetching services:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch services');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleRegisterClick = (service: ServiceItem) => {
        setSelectedService(service);
    };

    const handleConfirm = async () => {
        if (selectedService) {
            try {
                setRegisterLoading(true);

                // Gọi API tạo hóa đơn
                const success = await createInvoice(selectedService);

                if (success) {
                    alert(`✅ Bạn đã đăng ký dịch vụ "${selectedService.name}" thành công! Hóa đơn đã được tạo.`);
                }
            } catch (err) {
                alert(`❌ Có lỗi xảy ra khi đăng ký dịch vụ: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setRegisterLoading(false);
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
                                                    onClick={() => handleRegisterClick(service)}
                                                    className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-900 transition-colors whitespace-nowrap"
                                                >
                                                    Đăng ký
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal xác nhận đăng ký */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Xác nhận đăng ký</h2>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn đăng ký dịch vụ{" "}
                            <span className="font-semibold text-blue-600">{selectedService.name}</span>?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 text-left">
                            <div className="font-semibold mb-2">Thông tin dịch vụ:</div>
                            <div>• Tên dịch vụ: {selectedService.name}</div>
                            <div>• Loại dịch vụ: {selectedService.service_type}</div>
                            <div>• Giá: {selectedService.price}</div>
                            <div>• Hạn thanh toán: 30 ngày</div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleCancel}
                                disabled={registerLoading}
                                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={registerLoading}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {registerLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận'
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
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => handleRegisterClick(detailService)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Đăng ký ngay
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