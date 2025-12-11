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

const InvoiceAdmin: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [invoiceToPay, setInvoiceToPay] = useState<InvoiceItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State cho filter
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Fetch invoices from API
    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const baseURL = "http://localhost:3000";
            const token = localStorage.getItem("access_token");

            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const response = await fetch(`${baseURL}/admin/invoice/all`, {
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
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Hàm lấy trạng thái hiển thị
    const getStatusDisplay = (status: string): { text: string; color: string } => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
            'paid': { text: 'Đã thanh toán', color: 'text-green-600 bg-green-100' },
            'pending': { text: 'Đang chờ thanh toán', color: 'text-yellow-600 bg-yellow-100' },
            'unpaid': { text: 'Chưa thanh toán', color: 'text-red-600 bg-red-100' },
            'cancelled': { text: 'Đã hủy', color: 'text-gray-600 bg-gray-100' }
        };
        return statusMap[status] || { text: status, color: 'text-gray-600 bg-gray-100' };
    };

    // Hàm lấy thông tin service từ invoice
    const getServiceInfo = (invoice: InvoiceItem): ServiceInfo | null => {
        return invoice.info_runtime || invoice.info_storage || null;
    };

    // Hàm format thông tin liên hệ
    const formatContactInfo = (value: { String: string; Valid: boolean }): string => {
        return value.Valid ? value.String : 'Chưa cập nhật';
    };

    // Hàm filter invoices
    const filterInvoices = (): InvoiceItem[] => {
        let filtered = invoices;

        // Filter theo khoảng thời gian
        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Đặt thời gian về cuối ngày
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate <= end;
            });
        }

        // Filter theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }

        // Filter theo từ khóa tìm kiếm
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(invoice =>
                invoice.user?.name?.toLowerCase().includes(term) ||
                invoice.user?.email?.toLowerCase().includes(term) ||
                invoice.id.toLowerCase().includes(term) ||
                (getServiceInfo(invoice)?.name || '').toLowerCase().includes(term) ||
                invoice.service?.toLowerCase().includes(term)
            );
        }

        return filtered;
    };

    // Reset filter
    const resetFilter = () => {
        setStartDate("");
        setEndDate("");
        setStatusFilter("all");
        setSearchTerm("");
    };

    // Check if any filter is active
    const isFilterActive = () => {
        return startDate !== "" || endDate !== "" || statusFilter !== "all" || searchTerm !== "";
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
        // Refresh danh sách hóa đơn
        fetchInvoices();
        alert("✅ Thanh toán thành công!");
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setInvoiceToPay(null);
    };

    // Lấy danh sách invoices đã filter
    const filteredInvoices = filterInvoices();
    const unpaidInvoices = filteredInvoices.filter(invoice => invoice.status !== 'paid');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Đang tải hóa đơn...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64 p-4 text-center">
                <div className="text-lg text-red-600 mb-4">Lỗi: {error}</div>
                <button
                    onClick={fetchInvoices}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full max-w-xs"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-2 lg:mb-4">
                        Danh sách hóa đơn
                    </h1>
                    <p className="text-base lg:text-lg text-gray-600">
                        Theo dõi tất cả hóa đơn dịch vụ của bạn trên BNCloud
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 md:p-6 mb-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tên, email, mã hóa đơn..."
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
                                <option value="paid">Đã thanh toán</option>
                                <option value="pending">Đang chờ</option>
                                <option value="unpaid">Chưa thanh toán</option>
                                <option value="cancelled">Đã hủy</option>
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
                                {statusFilter !== "all" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Trạng thái: {getStatusDisplay(statusFilter).text}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Tìm kiếm: "{searchTerm}"
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-600 mb-1">Tổng số hóa đơn</div>
                        <div className="text-2xl font-bold text-gray-800">{filteredInvoices.length}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-600 mb-1">Chưa thanh toán</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {filteredInvoices.filter(i => i.status === 'unpaid').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-600 mb-1">Đang chờ</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {filteredInvoices.filter(i => i.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-600 mb-1">Đã thanh toán</div>
                        <div className="text-2xl font-bold text-green-600">
                            {filteredInvoices.filter(i => i.status === 'paid').length}
                        </div>
                    </div>
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 text-center">
                        <p className="text-gray-600 text-base lg:text-lg mb-4">
                            {isFilterActive() ? "Không tìm thấy hóa đơn nào phù hợp với bộ lọc" : "Không có hóa đơn nào"}
                        </p>
                        {isFilterActive() && (
                            <button
                                onClick={resetFilter}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full max-w-xs"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-x-auto">
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
                                    {filteredInvoices.map((invoice) => {
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
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                                                        {statusDisplay.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {filteredInvoices.map((invoice) => {
                                const statusDisplay = getStatusDisplay(invoice.status);
                                const serviceInfo = getServiceInfo(invoice);
                                return (
                                    <div
                                        key={invoice.id}
                                        className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
                                        onClick={() => handleDetailClick(invoice)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">
                                                    #{invoice.id.substring(0, 8)}...
                                                </div>
                                                <div className="text-lg font-semibold text-gray-900 mt-1">
                                                    {serviceInfo?.name || invoice.service}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                                                {statusDisplay.text}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 text-sm">Khách hàng:</span>
                                                <span className="font-medium text-gray-800 text-sm">{invoice.user?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 text-sm">Ngày tạo:</span>
                                                <span className="text-gray-700 text-sm">{invoice.date}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 text-sm">Số tiền:</span>
                                                <span className="font-bold text-blue-600">
                                                    {formatAmount(invoice.amount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDetailClick(invoice);
                                                }}
                                                className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Modal chi tiết hóa đơn */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-2 md:p-4">
                    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-2">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                                Hóa đơn #{selectedInvoice.id.substring(0, 8)}...
                            </h2>
                            <button
                                onClick={handleCloseDetail}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm md:text-base">
                            {selectedInvoice.details}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Thông tin khách hàng */}
                            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-gray-800">
                                    Thông tin khách hàng
                                </h3>
                                <div className="truncate">
                                    <span className="text-gray-600">Họ tên: </span>
                                    <span className="font-semibold block truncate">{selectedInvoice.user?.name}</span>
                                </div>
                                <div className="truncate">
                                    <span className="text-gray-600">Email: </span>
                                    <span className="font-semibold block truncate">{selectedInvoice.user?.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Điện thoại: </span>
                                    <span className="font-semibold">{formatContactInfo(selectedInvoice.user?.phone)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Địa chỉ: </span>
                                    <span className="font-semibold">{formatContactInfo(selectedInvoice.user?.address)}</span>
                                </div>
                            </div>

                            {/* Thông tin hóa đơn */}
                            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-gray-800">
                                    Thông tin hóa đơn
                                </h3>
                                <div>
                                    <span className="text-gray-600">Loại dịch vụ: </span>
                                    <span className="font-semibold capitalize">
                                        {selectedInvoice.service_type}
                                    </span>
                                </div>
                                <div className="truncate">
                                    <span className="text-gray-600">Service ID: </span>
                                    <span className="font-semibold block truncate">{selectedInvoice.service_id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ngày tạo: </span>
                                    <span className="font-semibold">{selectedInvoice.date}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Hạn thanh toán: </span>
                                    <span className="font-semibold">{formatDueDate(selectedInvoice.due_date)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số tiền: </span>
                                    <span className="font-semibold text-blue-600">{formatAmount(selectedInvoice.amount)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Trạng thái: </span>
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(selectedInvoice.status).color}`}>
                                        {getStatusDisplay(selectedInvoice.status).text}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Cập nhật lần cuối: </span>
                                    <span className="font-semibold">{formatDate(selectedInvoice.updated_at)}</span>
                                </div>
                            </div>

                            {/* Thông tin dịch vụ */}
                            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2 text-sm text-gray-700">
                                <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-gray-800">
                                    Thông tin dịch vụ
                                </h3>
                                {getServiceInfo(selectedInvoice) ? (
                                    <>
                                        <div className="truncate">
                                            <span className="text-gray-600">Tên dịch vụ: </span>
                                            <span className="font-semibold block truncate">{getServiceInfo(selectedInvoice)?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Mô tả: </span>
                                            <span className="font-semibold">{getServiceInfo(selectedInvoice)?.description}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">CPU: </span>
                                            <span className="font-semibold">{getServiceInfo(selectedInvoice)?.cpu} core</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">RAM: </span>
                                            <span className="font-semibold">{getServiceInfo(selectedInvoice)?.ram} MB</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Storage: </span>
                                            <span className="font-semibold">{getServiceInfo(selectedInvoice)?.storage} GB</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Version: </span>
                                            <span className="font-semibold">{getServiceInfo(selectedInvoice)?.version}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Trạng thái dịch vụ: </span>
                                            <span className="font-semibold">
                                                {getServiceInfo(selectedInvoice)?.status ? 'Hoạt động' : 'Tạm ngưng'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Giá gốc: </span>
                                            <span className="font-semibold text-green-600">
                                                {formatAmount(getServiceInfo(selectedInvoice)?.price || 0)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-500">Không có thông tin dịch vụ</div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-6">
                            <button
                                onClick={handleCloseDetail}
                                className="bg-gray-200 text-gray-700 px-4 py-3 md:py-2 rounded-lg hover:bg-gray-300 transition-colors w-full md:w-auto"
                            >
                                Đóng
                            </button>
                            {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'unpaid') && (
                                <button
                                    onClick={() => handlePayment(selectedInvoice)}
                                    className="bg-blue-600 text-white px-4 py-3 md:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
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
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default InvoiceAdmin;