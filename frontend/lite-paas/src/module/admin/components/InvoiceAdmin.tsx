import React, { useState, useEffect } from "react";
import { PaymentForm } from "../../payments/components/PaymentForm";
import { InvoiceItem } from "../../invoices/model/invoice";
import { ApiInvoices } from "../services/api";



export const InvoiceAdmin: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [invoiceToPay, setInvoiceToPay] = useState<InvoiceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await ApiInvoices();
            setInvoices(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || "Lỗi khi tải hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    const handlePayment = (invoice: InvoiceItem) => {
        setInvoiceToPay(invoice);
        setShowPaymentForm(true);
        setSelectedInvoice(null);
    };
    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        setInvoiceToPay(null);
        fetchInvoices();
    };
    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setInvoiceToPay(null);
    };

    const getServiceName = (invoice: InvoiceItem) =>
        invoice.info_runtime?.name || invoice.info_database?.name || 'Unknown Service';

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);

    const getStatusText = (status: boolean) => status ? "Đã thanh toán" : "Chưa thanh toán";

    if (loading) return <div>Đang tải hóa đơn...</div>;
    if (error) return <div>Lỗi: {error} <button onClick={fetchInvoices}>Thử lại</button></div>;

    return (
        <div className="p-4">
            {invoices.length === 0 ? (
                <p>Không có hóa đơn</p>
            ) : (
                <ul className="space-y-2">
                    {invoices.map(inv => (
                        <li
                            key={inv.id}
                            className={`p-2 border rounded flex justify-between items-center cursor-pointer
                                ${inv.status ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            onClick={() => setSelectedInvoice(inv)}
                        >
                            <span>#{inv.id.substring(0, 8)} - {getServiceName(inv)} - {inv.user.email} - {formatAmount(inv.amount)}</span>
                            <span>{getStatusText(inv.status)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal chi tiết hóa đơn */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded w-full max-w-md">
                        <h2 className="font-bold mb-2">Hóa đơn #{selectedInvoice.id.substring(0, 8)}</h2>
                        <p>Dịch vụ: {getServiceName(selectedInvoice)}</p>
                        <p>Số tiền: {formatAmount(selectedInvoice.amount)}</p>
                        <p>Trạng thái: {getStatusText(selectedInvoice.status)}</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button onClick={() => setSelectedInvoice(null)}>Đóng</button>
                            {!selectedInvoice.status && (
                                <button onClick={() => handlePayment(selectedInvoice)}>Thanh toán</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Form */}
            {showPaymentForm && invoiceToPay && (
                <PaymentForm
                    invoice={{
                        id: invoiceToPay.id,
                        amount: invoiceToPay.amount,
                        service: getServiceName(invoiceToPay),
                        due_date: invoiceToPay.due_date
                    }}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                />
            )}
        </div>
    );
};
