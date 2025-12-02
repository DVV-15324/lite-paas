import React, { useState, useEffect } from 'react';
import ChatPage from './ChatPage';

interface SupportRequestItem {
    id: string;
    service: string;
    title: string;
    date: string;
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

const services = [
    'Hỗ trợ kỹ thuật',
    'Hỗ trợ bán hàng',
    'Hỗ trợ thanh toán',
    'Hỗ trợ sản phẩm'
];

const baseURL = 'http://localhost:3000';

const SupportRequest: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState<SupportRequestItem[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequestItem | null>(null);
    const [loading, setLoading] = useState(false);

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
                service: ticket.service_type,
                title: ticket.title,
                date: new Date(ticket.created_at).toISOString().split('T')[0],
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

    // Create new support ticket
    const createSupportTicket = async (ticketData: {
        service_type: string;
        title: string;
        content: string;
        status: string;
    }) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${baseURL}/v2/support-ticket/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(ticketData),
            });

            if (!response.ok) {
                throw new Error('Failed to create support ticket');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating support ticket:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchSupportTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !title || !message) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            setLoading(true);

            const newTicketData = {
                service_type: selectedService,
                title: title,
                content: message,
                status: 'open'
            };

            const createdTicket = await createSupportTicket(newTicketData);

            // Transform the created ticket to match our local structure
            const newReq: SupportRequestItem = {
                id: createdTicket.id,
                service: createdTicket.service_type,
                title: createdTicket.title,
                date: new Date(createdTicket.created_at).toISOString().split('T')[0],
                status: 'Mới',
                content: createdTicket.content
            };

            setRequests([newReq, ...requests]);
            setShowModal(false);
            resetForm();

            alert('Tạo yêu cầu hỗ trợ thành công!');
        } catch (error) {
            console.error('Error submitting support request:', error);
            alert('Có lỗi xảy ra khi tạo yêu cầu hỗ trợ');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedService('');
        setTitle('');
        setMessage('');
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
                    >
                        + Tạo yêu cầu hỗ trợ
                    </button>
                </div>

                {/* Danh sách yêu cầu */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Danh sách yêu cầu</h2>
                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Đang tải...</p>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có yêu cầu nào.</p>
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
                                            </p>
                                            <p className="text-xs text-gray-400">{req.date}</p>
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
                                {/* Chọn dịch vụ */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dịch vụ
                                    </label>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn dịch vụ --</option>
                                        {services.map((srv, index) => (
                                            <option key={index} value={srv}>{srv}</option>
                                        ))}
                                    </select>
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
                                        placeholder="Anh/chị hãy mô tả chi tiết vấn đề cần hỗ trợ..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>

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
                                        disabled={loading}
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