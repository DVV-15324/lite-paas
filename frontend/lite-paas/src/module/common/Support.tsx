import React, { useState, useEffect } from 'react';
import ChatPage from './ChatPage';

interface SupportRequestItem {
    id: string;
    service: string;
    title: string;
    status: string;
    content?: string;
    service_type?: string;
    service_sub_id?: string;
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

const SupportRequest: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState<SupportRequestItem[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequestItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>([]);
    const [selectedServiceSubId, setSelectedServiceSubId] = useState('');

    // Fetch support tickets from API
    const fetchSupportTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${baseURL}/v2/support-ticket/`, {
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
            setServiceSubscriptions(allSubscriptions);

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



    // Create new support ticket
    const createSupportTicket = async (serviceSubId: string, ticketData: {
        service_type: string;
        title: string;
        content: string;
        status: string;
    }) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${baseURL}/v2/support-ticket/${serviceSubId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(ticketData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create ticket error:', errorText);
                throw new Error(`Failed to create support ticket: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating support ticket:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchSupportTickets();
        fetchServiceSubscriptions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        if (!selectedServiceSubId || !title || !message) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            setLoading(true);

            // Determine service type based on subscription
            const subscription = serviceSubscriptions.find(sub => sub.id === selectedServiceSubId);
            if (!subscription) {
                throw new Error('Không tìm thấy thông tin dịch vụ');
            }

            const newTicketData = {
                service_type: subscription.service_category, // Use runtime/storage
                title: title,
                content: message,
                status: 'open'
            };

            console.log('Creating ticket with data:', {
                serviceSubId: selectedServiceSubId,
                ...newTicketData
            });

            const createdTicket = await createSupportTicket(selectedServiceSubId, newTicketData);

            // Transform the created ticket to match our local structure
            const newReq: SupportRequestItem = {
                id: createdTicket.id,
                service: mapServiceTypeToVietnamese(createdTicket.service_type),
                title: createdTicket.title,

                status: 'open',
                content: createdTicket.content,
                service_type: createdTicket.service_type,
                service_sub_id: createdTicket.service_sub_id
            };

            setRequests([newReq, ...requests]);
            setShowModal(false);
            resetForm();

            alert('Tạo yêu cầu hỗ trợ thành công!');
        } catch (error) {
            console.error('Error submitting support request:', error);
            alert(`Có lỗi xảy ra khi tạo yêu cầu hỗ trợ: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedServiceSubId('');
        setTitle('');
        setMessage('');
    };

    // Get subscription display name
    const getSubscriptionDisplayName = (subscription: ServiceSubscription): string => {
        if (subscription.full_name) return subscription.full_name;
        return `${subscription.name}; (${subscription.service_category})`;
    };

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
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200"
                        disabled={serviceSubscriptions.length === 0}
                    >
                        + Tạo yêu cầu hỗ trợ
                    </button>
                </div>

                {/* Info about subscriptions */}
                {serviceSubscriptions.length === 0 && !loading && (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-yellow-700">
                            <span className="font-medium">Lưu ý:</span> Bạn chưa có dịch vụ nào đang sử dụng.
                            Vui lòng đăng ký dịch vụ trước khi tạo yêu cầu hỗ trợ.
                        </p>
                    </div>
                )}

                {/* Subscription count */}
                {serviceSubscriptions.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            Bạn đang sử dụng <span className="font-semibold">{serviceSubscriptions.length}</span> dịch vụ
                        </p>
                    </div>
                )}

                {/* Danh sách yêu cầu */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Danh sách yêu cầu hỗ trợ</h2>
                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Đang tải...</p>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có yêu cầu hỗ trợ nào.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <li
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className="py-4 cursor-pointer hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{req.title}</p>
                                            <p className="text-sm text-gray-600">
                                                {req.service}
                                                {req.service_sub_id && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        ID: {req.service_sub_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </p>

                                        </div>
                                        <span
                                            className={`text-sm px-3 py-1 rounded-full ${req.status === "Hoàn tất"
                                                ? "bg-green-100 text-green-600"
                                                : req.status === "Đang xử lý"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-blue-100 text-blue-600"
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Modal tạo yêu cầu */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[1000]">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-[1001] animate-fade-in">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo yêu cầu hỗ trợ</h2>
                            <form onSubmit={handleSubmit}>
                                {/* Chọn dịch vụ cụ thể (service_sub_id) */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dịch vụ cần hỗ trợ
                                    </label>
                                    <select
                                        value={selectedServiceSubId}
                                        onChange={(e) => setSelectedServiceSubId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn dịch vụ --</option>
                                        {serviceSubscriptions.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {getSubscriptionDisplayName(sub)}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Chọn dịch vụ cụ thể mà bạn cần hỗ trợ
                                    </p>
                                </div>

                                {/* Tiêu đề */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tiêu đề yêu cầu
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Mô tả */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả chi tiết
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Thông báo nếu không có service subscriptions */}
                                {serviceSubscriptions.length === 0 && (
                                    <div className="mb-5 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-sm text-yellow-700">
                                            <span className="font-medium">Lưu ý:</span> Bạn chưa có dịch vụ nào đang sử dụng.
                                            Vui lòng đăng ký dịch vụ trước khi tạo yêu cầu hỗ trợ.
                                        </p>
                                    </div>
                                )}

                                {/* Gửi */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mr-3 px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                                        disabled={loading || serviceSubscriptions.length === 0}
                                    >
                                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportRequest;