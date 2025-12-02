import { useEffect, useState } from "react";
import { API_BASE_URL, paymentService } from "../services/paymentService";
import { PaymentRequest } from "../services/paymentService";

interface PaymentFormProps {
    invoice?: {
        id: string;
        amount: number;
        service?: string;
        due_date?: string;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
    invoice,
    onSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState<PaymentRequest>({
        order_id: invoice?.id || `ORDER${Date.now()}`,
        amount: invoice?.amount || 100000,
        order_info: invoice?.service ? `Thanh toán dịch vụ ${invoice.service}` : 'Thanh toán đơn hàng',
        bank_code: '',
        order_type: 'billpayment',
        locale: 'vn',
    });

    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [step, setStep] = useState<'form' | 'confirm'>('form');

    // Check server status on component mount
    useEffect(() => {
        const checkServer = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/health`);
                if (response.ok) {
                    setServerStatus('online');
                } else {
                    setServerStatus('offline');
                }
            } catch (error) {
                setServerStatus('offline');
                console.error('Không thể kết nối đến server:', error);
            }
        };

        checkServer();
    }, []);

    // Update form data when invoice changes
    useEffect(() => {
        if (invoice) {
            setFormData(prev => ({
                ...prev,
                order_id: invoice.id,
                amount: invoice.amount,
                order_info: `Thanh toán dịch vụ ${invoice.service || 'Cloud Service'}`,
            }));
        }
    }, [invoice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (serverStatus !== 'online') {
            alert('⚠️ Server đang offline. Vui lòng kiểm tra kết nối.');
            return;
        }

        setLoading(true);

        try {
            console.log('🔄 Đang tạo thanh toán...', formData);

            const response = await paymentService.createPayment(formData);
            console.log('✅ Phản hồi từ server:', response);

            if (response.code === '00') {
                console.log('🔗 Chuyển hướng đến VNPay...');

                if (onSuccess) {
                    onSuccess();
                }

                // Chuyển hướng đến trang thanh toán VNPay
                window.location.href = response.url;
            } else {
                alert(`❌ Tạo thanh toán thất bại: ${response.message}`);
            }
        } catch (error: any) {
            console.error('💥 Lỗi thanh toán:', error);
            alert(`❌ Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại sau'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleConfirm = () => {
        setStep('confirm');
    };

    const handleBackToForm = () => {
        setStep('form');
    };

    const banks = [
        { value: '', label: 'Chọn ngân hàng (Tùy chọn)' },
        { value: 'NCB', label: 'Ngân hàng NCB' },
        { value: 'VCB', label: 'Vietcombank' },
        { value: 'BIDV', label: 'BIDV' },
        { value: 'VIB', label: 'VIB' },
        { value: 'ACB', label: 'ACB' },
        { value: 'MB', label: 'MB Bank' },
        { value: 'SCB', label: 'SCB' },
        { value: 'TPB', label: 'TPBank' },
        { value: 'AGB', label: 'Agribank' },
        { value: 'DAB', label: 'Đông Á Bank' },
        { value: 'HDB', label: 'HDBank' },
        { value: 'MSB', label: 'MSB' },
        { value: 'VAB', label: 'VietABank' },
        { value: 'VPB', label: 'VPBank' },
        { value: 'OCB', label: 'OCB' },
        { value: 'SHB', label: 'SHB' },
        { value: 'EIB', label: 'Eximbank' },
    ];

    const orderTypes = [
        { value: 'billpayment', label: 'Thanh toán hóa đơn' },
        { value: 'topup', label: 'Nạp tiền' },
        { value: 'fashion', label: 'Thời trang' },
        { value: 'electronic', label: 'Điện tử' },
        { value: 'other', label: 'Khác' },
    ];

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Thanh Toán VNPay
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">Giao dịch an toàn & bảo mật</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-white hover:text-blue-200 text-xl transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mt-4">
                        <div className={`flex items-center ${step === 'form' ? 'text-white' : 'text-blue-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'form' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                                1
                            </div>
                            <span className="ml-2 text-sm">Thông tin</span>
                        </div>
                        <div className="w-8 h-0.5 bg-blue-400 mx-2"></div>
                        <div className={`flex items-center ${step === 'confirm' ? 'text-white' : 'text-blue-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'confirm' ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
                                2
                            </div>
                            <span className="ml-2 text-sm">Xác nhận</span>
                        </div>
                    </div>
                </div>

                {/* Server Status */}
                <div className={`px-6 py-3 text-sm font-medium flex items-center justify-center ${serverStatus === 'online' ? 'bg-green-50 text-green-700' :
                    serverStatus === 'offline' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                    {serverStatus === 'online' ? (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Kết nối ổn định
                        </>
                    ) : serverStatus === 'offline' ? (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Mất kết nối server
                        </>
                    ) : (
                        <>
                            <svg className="animate-spin w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Đang kiểm tra kết nối...
                        </>
                    )}
                </div>

                {/* Payment Form */}
                <div className="p-6">
                    {step === 'form' ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                            {/* Invoice Info */}
                            {invoice && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                        Thông tin hóa đơn
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Mã hóa đơn:</span>
                                            <span className="font-semibold">#{invoice.id.substring(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Số tiền:</span>
                                            <span className="font-semibold text-green-600">{formatAmount(invoice.amount)}</span>
                                        </div>
                                        {invoice.service && (
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Dịch vụ:</span>
                                                <span className="font-semibold text-right">{invoice.service}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Order ID */}
                                <div >
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã đơn hàng
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="order_id"
                                            value={formData.order_id}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>

                                </div>

                                {/* Amount - Fixed when invoice exists */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số tiền (VND)
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>

                                </div>

                                {/* Order Info */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thông tin đơn hàng
                                    </label>
                                    <input
                                        type="text"
                                        name="order_info"
                                        value={formData.order_info}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={255}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* Order Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại giao dịch
                                    </label>
                                    <select
                                        name="order_type"
                                        value={formData.order_type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        {orderTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bank Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngân hàng
                                    </label>
                                    <select
                                        name="bank_code"
                                        value={formData.bank_code}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        {banks.map(bank => (
                                            <option key={bank.value} value={bank.value}>
                                                {bank.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Để trống để chọn tất cả ngân hàng
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={serverStatus !== 'online'}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Confirmation Step */
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận thanh toán</h3>
                                <p className="text-gray-600">Vui lòng kiểm tra thông tin trước khi tiếp tục</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đơn hàng:</span>
                                    <span className="font-semibold">{formData.order_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số tiền:</span>
                                    <span className="font-semibold text-green-600">{formatAmount(formData.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Thông tin:</span>
                                    <span className="font-semibold text-right">{formData.order_info}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loại giao dịch:</span>
                                    <span className="font-semibold">
                                        {orderTypes.find(t => t.value === formData.order_type)?.label}
                                    </span>
                                </div>
                                {formData.bank_code && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngân hàng:</span>
                                        <span className="font-semibold">
                                            {banks.find(b => b.value === formData.bank_code)?.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-yellow-700">
                                        <p className="font-medium">Lưu ý quan trọng</p>
                                        <p className="mt-1">Bạn sẽ được chuyển hướng đến trang thanh toán VNPay. Vui lòng không đóng trình duyệt cho đến khi hoàn tất.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleBackToForm}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        '💰 Thanh Toán Ngay'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Information */}
                {step === 'form' && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Giao dịch được bảo mật bởi VNPay</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};