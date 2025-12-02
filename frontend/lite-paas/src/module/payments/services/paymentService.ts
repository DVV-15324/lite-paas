
// Services
export const API_BASE_URL = 'http://localhost:3000/api';

export const paymentService = {
    createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
        const response = await fetch(`${API_BASE_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tạo thanh toán');
        }

        return response.json();
    },
};


// Hàm lấy mô tả lỗi
export const getErrorDescription = (errorCode: string): string => {
    const errorMap: { [key: string]: string } = {
        '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo)',
        '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
        '10': 'Khách hàng xác thực thông tin không đúng quá 3 lần',
        '11': 'Đã hết hạn chờ thanh toán',
        '12': 'Thẻ/Tài khoản bị khóa',
        '13': 'Sai mật khẩu xác thực (OTP)',
        '24': 'Khách hàng hủy giao dịch',
        '51': 'Tài khoản không đủ số dư',
        '65': 'Vượt quá hạn mức giao dịch trong ngày',
        '75': 'Ngân hàng đang bảo trì',
        '79': 'Sai mật khẩu thanh toán quá số lần quy định',
        '99': 'Lỗi không xác định'
    };
    return errorMap[errorCode] || 'Lỗi không xác định';
};


// Types
export interface PaymentRequest {
    order_id: string;
    amount: number;
    order_info: string;
    bank_code: string;
    order_type: string;
    locale: string;
}

export interface PaymentResponse {
    code: string;
    message: string;
    url: string;
}
