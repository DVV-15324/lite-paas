import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


export const PaymentResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const params: any = {};
        searchParams.forEach((value, key) => params[key] = value);

        let status: 'success' | 'failed' | 'pending' = 'pending';
        let message = 'Đang chờ xử lý...';
        let amount = 0;

        if (params.vnp_ResponseCode === '00') {
            status = 'success';
            message = 'Thanh toán thành công!';
            amount = params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : 0;
        } else if (params.vnp_ResponseCode) {
            status = 'failed';
            message = `Thanh toán thất bại. Mã lỗi: ${params.vnp_ResponseCode}`;
        }

        setResult({ status, message, data: params, displayAmount: amount });
    }, [searchParams]);

    if (!result)
        return <p className="text-center mt-20 text-gray-700">Đang xử lý kết quả...</p>;

    const { status, message, data, displayAmount } = result;

    return (
        <div className="p-6 font-sans max-w-lg mx-auto mt-10 text-center">
            {status === 'success' && <h2 className="text-3xl text-green-600 mb-4">✅ {message}</h2>}
            {status === 'failed' && <h2 className="text-3xl text-red-600 mb-4">❌ {message}</h2>}
            {status === 'pending' && <h2 className="text-3xl text-yellow-500 mb-4">⏳ {message}</h2>}

            {(status === 'success' || status === 'failed') && (
                <div className="bg-gray-100 p-4 rounded-md text-left mb-6">
                    <p><strong>Mã đơn hàng:</strong> {data.vnp_TxnRef}</p>
                    <p><strong>Số tiền:</strong> {displayAmount.toLocaleString()} VND</p>
                    {status === 'success' && <p><strong>Mã giao dịch VNPay:</strong> {data.vnp_TransactionNo}</p>}

                </div>
            )}

            <div className="flex justify-center gap-4">
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                    🏠 Về Trang Chủ
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition"
                >
                    🔄 Tải Lại
                </button>
            </div>
        </div>
    );
};
