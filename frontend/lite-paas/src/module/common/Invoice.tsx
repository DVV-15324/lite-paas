import React, { useState, useEffect } from "react";
import { PaymentForm } from "../payments/components/PaymentForm";


interface Phone {
    String: string;
    Valid: boolean;
}

interface Address {
    String: string;
    Valid: boolean;
}

interface User {
    id: string;
    name: string;
    phone: Phone;
    role: string;
    address: Address;
    email: string;
    deleted_at: string;
    created_at: string;
    updated_at: string;
}

interface ServiceInfo {
    id: string;
    name: string;
    price: number;
    cpu: number;
    ram: number;
    storage: number;
    description: string;
    version: string;
    status: boolean;
    service_type?: string;
    created_at: string;
    updated_at: string;
}

interface InvoiceItem {
    id: string;
    user_id: string;
    user: User;
    service_id: string;
    service_type: string;
    amount: number;
    status: string;
    due_date: string;
    created_at: string;
    updated_at: string;
    info_runtime?: ServiceInfo;
    info_storage?: ServiceInfo;
    customer?: string;
    service?: string;
    date?: string;
    details?: string;
}

const Invoice: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [invoiceToPay, setInvoiceToPay] = useState<InvoiceItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch invoices from API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const baseURL = "http://localhost:3000";
                const token = localStorage.getItem("access_token");

                if (!token) {
                    throw new Error("Không tìm thấy token xác thực");
                }

                const response = await fetch(`${baseURL}/v2/invoice/user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const invoicesData = await response.json();
                console.log("API Response:", invoicesData);

                // Transform API data to match component structure
                const transformedInvoices: InvoiceItem[] = Array.isArray(invoicesData)
                    ? invoicesData.map((invoice: any) => {
                        // Lấy thông tin service từ info_runtime hoặc info_storage
                        const serviceInfo = invoice.info_runtime || invoice.info_storage;

                        return {
                            ...invoice,
                            customer: invoice.user?.name || `KH${invoice.user_id?.substring(0, 6) || '000000'}`,
                            service: serviceInfo?.name || 'Unknown Service',
                            date: formatDate(invoice.created_at),
                            details: getInvoiceDetails(invoice, serviceInfo)
                        };
                    })
                    : [];

                setInvoices(transformedInvoices);
            } catch (err) {
                console.error('Error fetching invoices:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

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

    // Hàm format due date
    const formatDueDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    // Hàm tạo chi tiết hóa đơn
    const getInvoiceDetails = (invoice: any, serviceInfo: any): string => {
        return serviceInfo
            ? `Hóa đơn cho dịch vụ ${serviceInfo.name} - ${serviceInfo.description}`
            : `Hóa đơn cho dịch vụ ${invoice.service_type}`;
    };

    // Hàm format số tiền
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hàm lấy trạng thái hiển thị
    const getStatusDisplay = (status: string): { text: string; color: string } => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
            'paid': { text: 'Đã thanh toán', color: 'text-green-600' },
            'pending': { text: 'Đang chờ thanh toán', color: 'text-yellow-600' },
            'unpaid': { text: 'Chưa thanh toán', color: 'text-red-600' },
            'cancelled': { text: 'Đã hủy', color: 'text-gray-600' }
        };
        return statusMap[status] || { text: status, color: 'text-gray-600' };
    };

    // Hàm lấy thông tin service từ invoice
    const getServiceInfo = (invoice: InvoiceItem): ServiceInfo | null => {
        return invoice.info_runtime || invoice.info_storage || null;
    };

    // Hàm format thông tin liên hệ
    const formatContactInfo = (value: { String: string; Valid: boolean }): string => {
        return value.Valid ? value.String : 'Chưa cập nhật';
    };

    const handleDetailClick = (invoice: InvoiceItem) => {
        setSelectedInvoice(invoice);
    };

    const handleCloseDetail = () => {
        setSelectedInvoice(null);
    };

    const handlePayment = (invoice: InvoiceItem) => {
        setInvoiceToPay(invoice);
        setShowPaymentForm(true);
        setSelectedInvoice(null); // Đóng modal chi tiết khi mở form thanh toán
    };

    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        setInvoiceToPay(null);
        // Có thể thêm logic refresh danh sách hóa đơn ở đây
        alert("✅ Thanh toán thành công! Hóa đơn sẽ được cập nhật trong giây lát.");
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setInvoiceToPay(null);
    };

    // Hàm refresh danh sách hóa đơn
    const refreshInvoices = async () => {
        try {
            setLoading(true);
            const baseURL = "http://localhost:3000";
            const token = localStorage.getItem("access_token");

            const response = await fetch(`${baseURL}/v2/invoice/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const invoicesData = await response.json();
                const transformedInvoices: InvoiceItem[] = Array.isArray(invoicesData)
                    ? invoicesData.map((invoice: any) => {
                        const serviceInfo = invoice.info_runtime || invoice.info_storage;
                        return {
                            ...invoice,
                            customer: invoice.user?.name || `KH${invoice.user_id?.substring(0, 6) || '000000'}`,
                            service: serviceInfo?.name || 'Unknown Service',
                            date: formatDate(invoice.created_at),
                            details: getInvoiceDetails(invoice, serviceInfo)
                        };
                    })
                    : [];
                setInvoices(transformedInvoices);
            }
        } catch (err) {
            console.error('Error refreshing invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Đang tải hóa đơn...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-red-600">Lỗi: {error}</div>
                <button
                    onClick={refreshInvoices}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                        Danh sách hóa đơn
                    </h1>
                    <p className="text-lg text-gray-600">
                        Theo dõi tất cả hóa đơn dịch vụ của bạn trên BNCloud
                    </p>
                </div>

                {invoices.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <p className="text-gray-600 text-lg">Không có hóa đơn nào</p>
                        <button
                            onClick={refreshInvoices}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Tải lại
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100">
                                <tr className="text-left text-gray-600 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-3">Mã HĐ</th>
                                    <th className="px-6 py-3">Khách hàng</th>
                                    <th className="px-6 py-3">Dịch vụ</th>
                                    <th className="px-6 py-3">Ngày tạo</th>
                                    <th className="px-6 py-3">Số tiền</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const statusDisplay = getStatusDisplay(invoice.status);
                                    const serviceInfo = getServiceInfo(invoice);
                                    return (
                                        <tr
                                            key={invoice.id}
                                            className="border-b hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                                            onClick={() => handleDetailClick(invoice)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                #{invoice.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div>
                                                    <div className="font-semibold">{invoice.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{invoice.user?.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{serviceInfo?.name || invoice.service}</td>
                                            <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                                            <td className="px-6 py-4 font-semibold text-blue-600">
                                                {formatAmount(invoice.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-semibold ${statusDisplay.color}`}>
                                                    {statusDisplay.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal chi tiết hóa đơn */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-4xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Hóa đơn #{selectedInvoice.id}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {selectedInvoice.details}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Thông tin khách hàng */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800">Thông tin khách hàng</h3>
                                <div>Họ tên: <span className="font-semibold">{selectedInvoice.user?.name}</span></div>
                                <div>Email: <span className="font-semibold">{selectedInvoice.user?.email}</span></div>
                                <div>Điện thoại: <span className="font-semibold">{formatContactInfo(selectedInvoice.user?.phone)}</span></div>
                                <div>Địa chỉ: <span className="font-semibold">{formatContactInfo(selectedInvoice.user?.address)}</span></div>
                            </div>

                            {/* Thông tin hóa đơn */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800">Thông tin hóa đơn</h3>
                                <div>Loại dịch vụ: <span className="font-semibold capitalize">
                                    {selectedInvoice.service_type}
                                </span></div>
                                <div>Service ID: <span className="font-semibold">{selectedInvoice.service_id}</span></div>
                                <div>Ngày tạo: <span className="font-semibold">{selectedInvoice.date}</span></div>
                                <div>Hạn thanh toán: <span className="font-semibold">{formatDueDate(selectedInvoice.due_date)}</span></div>
                                <div>Số tiền: <span className="font-semibold text-blue-600">{formatAmount(selectedInvoice.amount)}</span></div>
                                <div>Trạng thái:
                                    <span className={`ml-2 font-semibold ${getStatusDisplay(selectedInvoice.status).color}`}>
                                        {getStatusDisplay(selectedInvoice.status).text}
                                    </span>
                                </div>
                                <div>Cập nhật lần cuối: <span className="font-semibold">{formatDate(selectedInvoice.updated_at)}</span></div>
                            </div>

                            {/* Thông tin dịch vụ */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800">Thông tin dịch vụ</h3>
                                {getServiceInfo(selectedInvoice) ? (
                                    <>
                                        <div>Tên dịch vụ: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.name}</span></div>
                                        <div>Mô tả: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.description}</span></div>
                                        <div>CPU: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.cpu} core</span></div>
                                        <div>RAM: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.ram} MB</span></div>
                                        <div>Storage: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.storage} GB</span></div>
                                        <div>Version: <span className="font-semibold">{getServiceInfo(selectedInvoice)?.version}</span></div>
                                        <div>Trạng thái dịch vụ: <span className="font-semibold">
                                            {getServiceInfo(selectedInvoice)?.status ? 'Hoạt động' : 'Tạm ngưng'}
                                        </span></div>
                                        <div>Giá gốc: <span className="font-semibold text-green-600">
                                            {formatAmount(getServiceInfo(selectedInvoice)?.price || 0)}
                                        </span></div>
                                    </>
                                ) : (
                                    <div className="text-gray-500">Không có thông tin dịch vụ</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                            {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'unpaid') && (
                                <button
                                    onClick={() => handlePayment(selectedInvoice)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Form Modal */}
            {showPaymentForm && invoiceToPay && (
                <PaymentForm
                    invoice={{
                        id: invoiceToPay.id,
                        amount: invoiceToPay.amount,
                        service: invoiceToPay.service,
                        due_date: invoiceToPay.due_date
                    }}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                />
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

export default Invoice;