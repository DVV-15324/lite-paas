import React, { useState, useEffect } from 'react';
import ChatPage from './ChatPageAdmin';

interface SupportRequestItem {
    id: string;
    service: string;
    title: string;
    status: string;
    content?: string;
    service_type?: string;
    service_sub_id?: string;
    originalStatus?: string; // Thêm trường lưu trạng thái gốc
}

interface ApiSupportTicket {
    id: string;
    user_id: string;
    service_sub_id: string;
    service_type: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface ServiceSubscription {
    id: string;
    name: string;
    service_type: string;
    service_category: 'runtime' | 'storage';
    full_name?: string;
    description?: string;
    link_return?: string;
}

interface RuntimeSubscription {
    id: string;
    info_runtime: {
        name: string;
        description: string;
    };
    link_return: string;
}

interface StorageSubscription {
    Id: string;
    info_storage: {
        name: string;
        description: string;
        service_type: 'database' | 'storage';
    };
    link_return: string;
}

const baseURL = 'http://localhost:3000';

const SupportRequestAdmin: React.FC = () => {
    const [requests, setRequests] = useState<SupportRequestItem[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequestItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Fetch support tickets from API
    const fetchSupportTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${baseURL}/admin/support-ticket/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch support tickets');
            }

            const data: ApiSupportTicket[] = await response.json();

            // Transform API data to match our component's structure
            const transformedData: SupportRequestItem[] = data.map(ticket => ({
                id: ticket.id,
                service: mapServiceTypeToVietnamese(ticket.service_type),
                title: ticket.title,
                status: mapStatusToVietnamese(ticket.status),
                originalStatus: ticket.status, // Lưu trạng thái gốc
                content: ticket.content,
                service_type: ticket.service_type,
                service_sub_id: ticket.service_sub_id
            }));

            setRequests(transformedData);
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            alert('Không thể tải danh sách yêu cầu hỗ trợ');
        } finally {
            setLoading(false);
        }
    };

    // Update ticket status to "done"
    const updateTicketStatus = async (ticketId: string) => {
        try {
            setUpdatingStatus(ticketId);
            const token = localStorage.getItem("access_token");

            // Gọi API cập nhật trạng thái
            const response = await fetch(`${baseURL}/admin/support-ticket/update-status/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: 'resolved' // Hoặc 'closed' tùy theo API
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update ticket status');
            }

            const result = await response.json();
            console.log('Status updated:', result);

            // Cập nhật local state
            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === ticketId
                        ? {
                            ...request,
                            status: 'Hoàn tất',
                            originalStatus: 'resolved'
                        }
                        : request
                )
            );

            alert('Đã cập nhật trạng thái thành công!');
        } catch (error) {
            console.error('Error updating ticket status:', error);
            alert('Không thể cập nhật trạng thái');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Xác nhận cập nhật status
    const confirmUpdateStatus = (ticketId: string, title: string) => {
        if (window.confirm(`Bạn có chắc muốn đánh dấu yêu cầu "${title}" là đã xử lý?`)) {
            updateTicketStatus(ticketId);
        }
    };

    // Fetch all service subscriptions (runtime + storage)
    const fetchServiceSubscriptions = async () => {
        try {
            const token = localStorage.getItem("access_token");

            // Fetch both runtime and storage subscriptions in parallel
            const [runtimeResponse, storageResponse] = await Promise.all([
                fetch(`${baseURL}/v2/sub-runtime/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }),
                fetch(`${baseURL}/v2/sub-storage/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })
            ]);

            const runtimeData: RuntimeSubscription[] = runtimeResponse.ok ? await runtimeResponse.json() : [];
            const storageData: StorageSubscription[] = storageResponse.ok ? await storageResponse.json() : [];

            // Transform runtime subscriptions
            const runtimeSubscriptions: ServiceSubscription[] = runtimeData.map(sub => ({
                id: sub.id,
                name: sub.info_runtime?.name || 'Runtime Service',
                service_type: 'runtime',
                service_category: 'runtime',
                full_name: `${sub.info_runtime?.name || 'Runtime'} (Runtime)  (${sub.id})`,
                description: sub.info_runtime?.description,
                link_return: sub.link_return
            }));

            // Transform storage subscriptions
            const storageSubscriptions: ServiceSubscription[] = storageData.map(sub => ({
                id: sub.Id,
                name: sub.info_storage?.name || 'Storage Service',
                service_type: sub.info_storage?.service_type || 'storage',
                service_category: 'storage',
                full_name: `${sub.info_storage?.name || 'Storage'} (${sub.info_storage?.service_type || 'Storage'})  (${sub.Id})`,
                description: sub.info_storage?.description,
                link_return: sub.link_return
            }));

            // Combine all subscriptions
            const allSubscriptions = [...runtimeSubscriptions, ...storageSubscriptions];

            console.log('Service subscriptions loaded:', allSubscriptions.length);
        } catch (error) {
            console.error('Error fetching service subscriptions:', error);
        }
    };

    // Map API status to Vietnamese
    const mapStatusToVietnamese = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'open': 'Mới',
            'in_progress': 'Đang xử lý',
            'closed': 'Hoàn tất',
            'resolved': 'Hoàn tất'
        };
        return statusMap[status] || status;
    };

    // Map service type to Vietnamese
    const mapServiceTypeToVietnamese = (serviceType: string): string => {
        const serviceMap: { [key: string]: string } = {
            'runtime': 'Runtime Service',
            'database': 'Database Service',
            'storage': 'Storage Service',
            'sales': 'Hỗ trợ bán hàng',
            'payment': 'Hỗ trợ thanh toán',
            'product': 'Hỗ trợ sản phẩm'
        };
        return serviceMap[serviceType] || serviceType;
    };

    // Lấy màu cho trạng thái
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Hoàn tất':
                return 'bg-green-100 text-green-600';
            case 'Đang xử lý':
                return 'bg-yellow-100 text-yellow-600';
            case 'Mới':
                return 'bg-blue-100 text-blue-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    useEffect(() => {
        fetchSupportTickets();
        fetchServiceSubscriptions();
    }, []);

    if (selectedRequest) {
        return <ChatPage request={selectedRequest} onBack={() => setSelectedRequest(null)} />;
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                        Kênh hỗ trợ
                    </h1>
                    <div className="text-sm text-gray-600">
                        Tổng số: {requests.length} yêu cầu
                    </div>
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="text-sm text-gray-600">Mới</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {requests.filter(req => req.status === 'Mới').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="text-sm text-gray-600">Đang xử lý</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {requests.filter(req => req.status === 'Đang xử lý').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="text-sm text-gray-600">Hoàn tất</div>
                        <div className="text-2xl font-bold text-green-600">
                            {requests.filter(req => req.status === 'Hoàn tất').length}
                        </div>
                    </div>
                </div>

                {/* Danh sách yêu cầu */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Danh sách yêu cầu hỗ trợ</h2>
                        <button
                            onClick={fetchSupportTickets}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                            Làm mới
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">Chưa có yêu cầu hỗ trợ nào.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <li
                                    key={req.id}
                                    className="py-4 hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{req.title}</p>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        {req.service}
                                                        {req.service_sub_id && (
                                                            <span className="ml-2 text-xs text-gray-400">
                                                                ID: {req.service_sub_id.substring(0, 8)}...
                                                            </span>
                                                        )}
                                                    </p>
                                                    {req.content && (
                                                        <p className="text-sm text-gray-500 line-clamp-1">
                                                            {req.content}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end space-y-2 ml-4">
                                            <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>

                                            {req.status !== 'Hoàn tất' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmUpdateStatus(req.id, req.title);
                                                    }}
                                                    disabled={updatingStatus === req.id}
                                                    className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${updatingStatus === req.id
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {updatingStatus === req.id ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Đang xử lý...
                                                        </>
                                                    ) : (
                                                        'Đánh dấu đã xử lý'
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 whitespace-nowrap"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Chú thích */}
                <div className="mt-4 text-sm text-gray-500 flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-100 rounded-full mr-1"></div>
                        <span>Mới</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-100 rounded-full mr-1"></div>
                        <span>Đang xử lý</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 rounded-full mr-1"></div>
                        <span>Hoàn tất</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportRequestAdmin;