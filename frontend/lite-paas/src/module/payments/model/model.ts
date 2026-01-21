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
