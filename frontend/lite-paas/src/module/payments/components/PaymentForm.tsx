import { useEffect, useState } from "react";
import { paymentService } from "../services/paymentService";
import { PaymentRequest } from "../model/model";
interface PaymentFormProps {
    invoice?: { id: string; amount: number; service?: string; due_date?: string };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ invoice, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<PaymentRequest>({
        order_id: invoice?.id || `ORDER${Date.now()}`,
        amount: invoice?.amount || 10000,
        order_info: invoice?.id || 'Thanh toán đơn hàng',
        bank_code: '',
        order_type: 'billpayment',
        locale: 'vn',
    });

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'confirm'>('form');

    useEffect(() => {
        if (invoice) {
            setFormData(prev => ({
                ...prev,
                order_id: `ORDER${Math.floor(Math.random() * 1000000)}`, // mã hóa đơn random
                amount: invoice.amount,
                order_info: invoice.id, // Thông tin đơn hàng = ID hóa đơn
            }));
        }
    }, [invoice]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await paymentService.createPayment(formData);
            if (response.code === '00') {
                onSuccess?.();
                window.location.href = response.url;
            } else {
                alert(`Thanh toán thất bại: ${response.message}`);
            }
        } catch (error: any) {
            alert(`Lỗi: ${error.message || 'Thử lại sau'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const banks = [
        { value: '', label: 'Chọn ngân hàng (Tùy chọn)' },
        { value: 'NCB', label: 'Ngân hàng NCB' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Thanh Toán VNPay</h2>
                    <button onClick={onCancel} className="text-xl">×</button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={e => { e.preventDefault(); setStep('confirm'); }}>
                        {invoice && (
                            <div className="mb-4 p-3 border rounded bg-gray-50 space-y-1">
                                <div>Mã hóa đơn: <strong>{formData.order_id}</strong></div>
                                <div>Thông tin đơn hàng: <strong>{formData.order_info}</strong></div>
                                <div>Số tiền: <strong className="text-green-600">{formatAmount(invoice.amount)}</strong></div>
                            </div>
                        )}

                        <div className="mb-3">
                            <label>Ngân hàng</label>
                            <select name="bank_code" value={formData.bank_code} onChange={handleInputChange} className="w-full border rounded px-2 py-1">
                                {banks.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={onCancel} className="flex-1 border px-4 py-2 rounded">Hủy</button>
                            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">Tiếp tục</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <h3 className="text-center font-semibold mb-4">Xác nhận thanh toán</h3>
                        <div className="mb-4 p-3 border rounded bg-gray-50 space-y-1">
                            <div>Mã hóa đơn: {formData.order_id}</div>
                            <div>Thông tin: {formData.order_info}</div>
                            <div>Số tiền: <strong className="text-green-600">{formatAmount(formData.amount)}</strong></div>
                            {formData.bank_code && <div>Ngân hàng: {banks.find(b => b.value === formData.bank_code)?.label}</div>}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setStep('form')} className="flex-1 border px-4 py-2 rounded">Quay lại</button>
                            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white px-4 py-2 rounded">
                                {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
