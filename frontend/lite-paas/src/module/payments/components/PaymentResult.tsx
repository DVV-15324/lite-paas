import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getErrorDescription } from '../services/paymentService';




// Component xử lý kết quả thanh toán
export const PaymentResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processPaymentResult = () => {
            console.log('🎯 Bắt đầu xử lý kết quả thanh toán...');

            // Lấy tất cả parameters từ URL
            const allParams: any = {};
            searchParams.forEach((value, key) => {
                allParams[key] = value;
            });

            console.log('📊 Tất cả parameters từ VNPay:', allParams);

            // Log chi tiết từng parameter
            console.log('=== CHI TIẾT KẾT QUẢ THANH TOÁN ===');
            console.log('💰 Mã phản hồi (vnp_ResponseCode):', allParams.vnp_ResponseCode);
            console.log('🔢 Mã giao dịch (vnp_TransactionNo):', allParams.vnp_TransactionNo);
            console.log('📦 Mã đơn hàng (vnp_TxnRef):', allParams.vnp_TxnRef);
            console.log('💵 Số tiền (vnp_Amount):', allParams.vnp_Amount);
            console.log('🏦 Ngân hàng (vnp_BankCode):', allParams.vnp_BankCode);
            console.log('📝 Thông tin đơn hàng (vnp_OrderInfo):', allParams.vnp_OrderInfo);
            console.log('🔐 Chữ ký (vnp_SecureHash):', allParams.vnp_SecureHash);
            console.log('📅 Ngày thanh toán (vnp_PayDate):', allParams.vnp_PayDate);
            console.log('================================');

            // Xác định trạng thái thanh toán
            let status = 'unknown';
            let message = '';
            let amount = 0;

            if (allParams.vnp_ResponseCode === '00') {
                status = 'success';
                message = 'Thanh toán thành công!';
                amount = allParams.vnp_Amount ? parseInt(allParams.vnp_Amount) / 100 : 0;
            } else if (allParams.vnp_ResponseCode) {
                status = 'failed';
                message = `Thanh toán thất bại. Mã lỗi: ${allParams.vnp_ResponseCode}`;
            } else {
                status = 'pending';
                message = 'Đang chờ xử lý kết quả...';
            }

            const resultData = {
                status,
                message,
                data: allParams,
                displayAmount: amount,
            };

            setResult(resultData);
            setLoading(false);

            // Log kết quả cuối cùng
            console.log('🎊 KẾT QUẢ CUỐI CÙNG:', resultData);
        };

        processPaymentResult();
    }, [searchParams]);

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#dbdbdbff',
                minHeight: '100vh',
                color: 'white',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div style={{
                    background: 'white',
                    color: '#333',
                    padding: '40px',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    margin: '50px auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h2>🔄 Đang xử lý kết quả...</h2>
                    <p>Vui lòng chờ trong giây lát</p>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '20px auto'
                    }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            background: '#dbdbdbff',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                margin: '20px auto',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                textAlign: 'center'
            }}>
                {result.status === 'success' && (
                    <>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
                        <h1 style={{ color: '#27ae60', marginBottom: '10px' }}>Thanh Toán Thành Công!</h1>
                        <p style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '20px' }}>
                            {result.message}
                        </p>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            margin: '20px 0',
                            textAlign: 'left'
                        }}>
                            <h3>📋 Thông tin giao dịch:</h3>
                            <p><strong>Mã đơn hàng:</strong> {result.data.vnp_TxnRef}</p>
                            <p><strong>Số tiền:</strong> {result.displayAmount.toLocaleString()} VND</p>
                            <p><strong>Mã giao dịch VNPay:</strong> {result.data.vnp_TransactionNo}</p>
                            <p><strong>Ngân hàng:</strong> {result.data.vnp_BankCode}</p>
                            <p><strong>Thời gian:</strong> {result.data.vnp_PayDate || 'N/A'}</p>
                        </div>
                    </>
                )}

                {result.status === 'failed' && (
                    <>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
                        <h1 style={{ color: '#e74c3c', marginBottom: '10px' }}>Thanh Toán Thất Bại</h1>
                        <p style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '20px' }}>
                            {result.message}
                        </p>
                        <div style={{
                            background: '#ffeaa7',
                            padding: '20px',
                            borderRadius: '8px',
                            margin: '20px 0',
                            textAlign: 'left'
                        }}>
                            <h3>⚠️ Thông tin lỗi:</h3>
                            <p><strong>Mã lỗi:</strong> {result.data.vnp_ResponseCode}</p>
                            <p><strong>Mã đơn hàng:</strong> {result.data.vnp_TxnRef}</p>
                            <p><strong>Mô tả lỗi:</strong> {getErrorDescription(result.data.vnp_ResponseCode)}</p>
                        </div>
                    </>
                )}

                {result.status === 'pending' && (
                    <>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>⏳</div>
                        <h1 style={{ color: '#f39c12', marginBottom: '10px' }}>Đang Xử Lý</h1>
                        <p style={{ fontSize: '18px', color: '#2c3e50' }}>
                            Hệ thống đang xử lý kết quả thanh toán của bạn.
                        </p>
                    </>
                )}

                <div style={{ marginTop: '30px' }}>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px'
                        }}
                    >
                        🏠 Về Trang Chủ
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#95a5a6',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px'
                        }}
                    >
                        🔄 Tải Lại
                    </button>
                </div>

                {/* Debug Info */}
                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    background: '#2c3e50',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    textAlign: 'left'
                }}>
                    <h4>🔧 Thông tin Debug (Xem console để biết chi tiết):</h4>
                    <p>Mã phản hồi: {result.data.vnp_ResponseCode || 'N/A'}</p>
                    <p>Mã giao dịch: {result.data.vnp_TransactionNo || 'N/A'}</p>
                </div>
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

