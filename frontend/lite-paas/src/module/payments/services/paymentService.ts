import { PaymentRequest, PaymentResponse } from "../model/model";
import { axiosInstance } from "../../../shared/axios/api"


export const paymentService = {
    createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
        try {
            const response = await axiosInstance.post<PaymentResponse>(
                `api/payment/create`,
                paymentData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Không thể tạo thanh toán';
            throw new Error(message);
        }
    },
};
