import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Interface cho Invoice từ API
interface Invoice {
    id: string;
    user_id: string;
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
    service_id: string;
    service_type: string;
    amount: number;
    status: string;
    info_storage?: {
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
    info_runtime?: {
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
    due_date: string;
    created_at: string;
    updated_at: string;
}

const baseURL = 'http://localhost:3000';

const HistoryInvoice: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Lấy danh sách năm từ invoices (loại bỏ pending)
    const getYears = () => {
        const years = new Set<string>();
        invoices.forEach(invoice => {
            if (invoice.status.toLowerCase() !== "pending") {
                const year = new Date(invoice.created_at).getFullYear().toString();
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    };

    // Lấy danh sách tháng
    const months = [
        { value: "", label: "Tất cả tháng" },
        { value: "1", label: "Tháng 1" },
        { value: "2", label: "Tháng 2" },
        { value: "3", label: "Tháng 3" },
        { value: "4", label: "Tháng 4" },
        { value: "5", label: "Tháng 5" },
        { value: "6", label: "Tháng 6" },
        { value: "7", label: "Tháng 7" },
        { value: "8", label: "Tháng 8" },
        { value: "9", label: "Tháng 9" },
        { value: "10", label: "Tháng 10" },
        { value: "11", label: "Tháng 11" },
        { value: "12", label: "Tháng 12" },
    ];

    // Lọc invoices theo năm/tháng và LOẠI BỎ PENDING
    const filteredInvoices = invoices.filter(invoice => {
        // Loại bỏ invoices có status = "pending"
        if (invoice.status.toLowerCase() === "pending") {
            return false;
        }

        const date = new Date(invoice.created_at);
        const invoiceYear = date.getFullYear().toString();
        const invoiceMonth = (date.getMonth() + 1).toString();

        if (selectedYear && invoiceYear !== selectedYear) return false;
        if (selectedMonth && invoiceMonth !== selectedMonth) return false;

        return true;
    });



    // Tính tổng số tiền đã thanh toán (chỉ tính các status không phải pending)
    const getTotalPaidAmount = () => {
        return filteredInvoices
            .filter(invoice => invoice.status.toLowerCase() === "paid")
            .reduce((total, invoice) => total + invoice.amount, 0);
    };

    // Đếm số hóa đơn đã thanh toán
    const getPaidInvoicesCount = () => {
        return filteredInvoices.filter(invoice => invoice.status.toLowerCase() === "paid").length;
    };

    // Đếm số hóa đơn không phải pending
    const getNonPendingInvoicesCount = () => {
        return filteredInvoices.length;
    };

    // Định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Định dạng ngày tháng
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Định dạng ngày giờ đầy đủ
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Lấy tên dịch vụ
    const getServiceName = (invoice: Invoice) => {
        if (invoice.info_storage) {
            return invoice.info_storage.name;
        }
        if (invoice.info_runtime) {
            return invoice.info_runtime.name;
        }
        return "Không xác định";
    };

    // Lấy loại dịch vụ
    const getServiceType = (invoice: Invoice) => {
        if (invoice.info_storage) {
            return invoice.info_storage.service_type === "database" ? "Database" : "Storage";
        }
        if (invoice.info_runtime) {
            return "Runtime";
        }
        return "Không xác định";
    };

    // Màu sắc cho trạng thái
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'expired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Văn bản trạng thái
    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'cancelled':
                return 'Đã hủy';
            case 'expired':
                return 'Hết hạn';
            default:
                return status;
        }
    };

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("access_token");
                if (!token) {
                    throw new Error("Access token not found");
                }

                const response = await fetch(`${baseURL}/v2/invoice/user`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data: Invoice[] = await response.json();
                setInvoices(data);

                // Set năm mặc định là năm mới nhất (chỉ tính non-pending)
                if (data.length > 0) {
                    const nonPendingInvoices = data.filter(inv => inv.status.toLowerCase() !== "pending");
                    if (nonPendingInvoices.length > 0) {
                        const years = getYears();
                        if (years.length > 0) {
                            setSelectedYear(years[0]);
                        }
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    // Download PDF
    const handleDownloadInvoice = async (invoice: Invoice) => {
        const element = document.createElement("div");

        element.style.width = "800px";
        element.style.padding = "40px";
        element.style.fontFamily = "Arial, sans-serif";
        element.style.fontSize = "18px";
        element.style.lineHeight = "1.6";

        element.innerHTML = `
    <div style="text-align:center; margin-bottom: 30px;">
        <h1 style="font-size: 32px; margin-bottom: 5px;">HÓA ĐƠN THANH TOÁN</h1>
        <p style="font-size: 18px;">LitePaas Services</p>
    </div>

    <p><b>Mã hóa đơn:</b> ${invoice.id}</p>

    <h2 style="margin-top: 20px; font-size: 24px;">Thông tin khách hàng</h2>
    <p><b>Tên:</b> ${invoice.user.name}</p>
    <p><b>Email:</b> ${invoice.user.email}</p>

    <h2 style="margin-top: 20px; font-size: 24px;">Thông tin dịch vụ</h2>
    <p><b>Tên dịch vụ:</b> ${getServiceName(invoice)}</p>
    <p><b>Loại:</b> ${getServiceType(invoice)}</p>
    <p><b>Ngày tạo:</b> ${formatDateTime(invoice.created_at)}</p>
    <p><b>Hạn thanh toán:</b> ${formatDateTime(invoice.due_date)}</p>

    <h2 style="margin-top: 20px; font-size: 24px;">Thanh toán</h2>
    <p><b>Số tiền:</b> ${formatCurrency(invoice.amount)}</p>
    <p><b>Trạng thái:</b> ${getStatusText(invoice.status)}</p>

    <div style="margin-top: 40px; text-align:center; font-size: 22px;">
        <b>TỔNG CỘNG: ${formatCurrency(invoice.amount)}</b>
    </div>

    <p style="margin-top: 60px; text-align:center; font-size: 16px;">
        Cảm ơn bạn đã sử dụng dịch vụ của LitePaas!
    </p>
    `;

        document.body.appendChild(element);

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`invoice-${invoice.id}.pdf`);

        document.body.removeChild(element);
    };

    // Xem chi tiết modal
    const handleViewDetail = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedInvoice(null);
    };





    // Loading state
    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-center text-gray-600">Đang tải dữ liệu hóa đơn...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6 p-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
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
        );
    }

    // Lọc các invoice có status không phải "pending"
    const nonPendingInvoices = invoices.filter(invoice =>
        invoice.status.toLowerCase() !== "pending"
    );

    // Empty state
    if (nonPendingInvoices.length === 0) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Lịch sử hóa đơn</h2>
                        <p className="text-gray-600">Theo dõi và quản lý lịch sử thanh toán dịch vụ</p>
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">

                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có hóa đơn nào đã xử lý
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {invoices.length === 0
                            ? "Bạn chưa có hóa đơn nào trong hệ thống"
                            : "Tất cả hóa đơn hiện tại đang ở trạng thái chờ thanh toán"}
                    </p>
                    {invoices.some(inv => inv.status.toLowerCase() === "pending") && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700 text-sm">
                                Có {invoices.filter(inv => inv.status.toLowerCase() === "pending").length} hóa đơn đang chờ thanh toán
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Lịch sử hóa đơn</h2>
                    <p className="text-gray-600">Theo dõi và quản lý lịch sử thanh toán dịch vụ</p>
                    <p className="text-sm text-gray-500 mt-1">
                        * Chỉ hiển thị hóa đơn đã thanh toán hoặc đã kết thúc
                    </p>
                </div>

                {/* Filters - Stack trên mobile */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);

                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Tất cả năm</option>
                            {getYears().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);

                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Grid responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Tổng đã thanh toán</p>
                            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(getTotalPaidAmount())}</p>
                        </div>

                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Hóa đơn đã thanh toán</p>
                            <p className="text-xl sm:text-2xl font-bold">{getPaidInvoicesCount()}</p>
                        </div>

                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Hóa đơn đã xử lý</p>
                            <p className="text-xl sm:text-2xl font-bold">{getNonPendingInvoicesCount()}</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Pending invoices warning */}
            {invoices.some(inv => inv.status.toLowerCase() === "pending") && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm text-yellow-700">
                                Bạn có {invoices.filter(inv => inv.status.toLowerCase() === "pending").length} hóa đơn đang chờ thanh toán.
                                Chúng sẽ không hiển thị ở đây cho đến khi được xử lý.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {invoices
                    .filter((invoice) => invoice.status === "paid")
                    .map((invoice) => (

                        <div key={invoice.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Mã hóa đơn</div>
                                    <div className="text-xs text-gray-500 font-mono">{invoice.id.slice(0, 12)}...</div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                    {getStatusText(invoice.status)}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Dịch vụ:</span>
                                    <span className="text-sm font-medium">{getServiceName(invoice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Loại:</span>
                                    <span className="text-sm font-medium">{getServiceType(invoice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Ngày tạo:</span>
                                    <span className="text-sm">{formatDate(invoice.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Số tiền:</span>
                                    <span className="text-sm font-bold">{formatCurrency(invoice.amount)}</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleViewDetail(invoice)}
                                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                >
                                    Chi tiết
                                </button>
                                <button
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                    Tải PDF
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã hóa đơn
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dịch vụ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số tiền
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices
                                .filter((invoice) => invoice.status === "paid")
                                .map((invoice) => (

                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-mono text-gray-900 font-medium">
                                                {invoice.id.slice(0, 8)}...
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {invoice.id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">{formatDate(invoice.created_at)}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {getServiceName(invoice)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceType(invoice) === 'Database' ? 'bg-blue-100 text-blue-800' : getServiceType(invoice) === 'Runtime' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {getServiceType(invoice)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatCurrency(invoice.amount)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                                {getStatusText(invoice.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDetail(invoice)}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadInvoice(invoice)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                >
                                                    Tải PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Empty State - nếu filter không có kết quả */}
            {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy hóa đơn phù hợp
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Vui lòng thử lại với bộ lọc khác
                    </p>
                </div>
            )}

            {/* Summary */}
            {filteredInvoices.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                            Tổng cộng đã thanh toán: <span className="text-green-600">{formatCurrency(getTotalPaidAmount())}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chi tiết */}
            {showDetailModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Chi tiết hóa đơn</h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Thông tin chung */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Thông tin chung</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Mã hóa đơn</p>
                                            <p className="font-mono text-gray-900">{selectedInvoice.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Trạng thái</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                                                {getStatusText(selectedInvoice.status)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Ngày tạo</p>
                                            <p className="text-gray-900">{formatDateTime(selectedInvoice.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Hạn thanh toán</p>
                                            <p className="text-gray-900">{formatDateTime(selectedInvoice.due_date)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin khách hàng */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Thông tin khách hàng</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Tên</p>
                                            <p className="text-gray-900">{selectedInvoice.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="text-gray-900">{selectedInvoice.user.email}</p>
                                        </div>
                                        {selectedInvoice.user.phone.Valid && (
                                            <div>
                                                <p className="text-sm text-gray-600">Số điện thoại</p>
                                                <p className="text-gray-900">{selectedInvoice.user.phone.String}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Thông tin dịch vụ */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Thông tin dịch vụ</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Tên dịch vụ</p>
                                            <p className="text-gray-900 font-medium">{getServiceName(selectedInvoice)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Loại dịch vụ</p>
                                            <p className="text-gray-900">{getServiceType(selectedInvoice)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin thanh toán */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Thông tin thanh toán</h4>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Số tiền</p>
                                            <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedInvoice.amount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            handleDownloadInvoice(selectedInvoice);
                                            handleCloseModal();
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                    >
                                        Tải hóa đơn PDF
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryInvoice;