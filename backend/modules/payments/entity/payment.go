package payment

import (
	"lite-paas/shared/uid"
	"time"
)

type PaymentRequest struct {
	OrderID   string  `json:"order_id"`
	Amount    float64 `json:"amount"`
	OrderInfo string  `json:"order_info"`
	BankCode  string  `json:"bank_code"`
	OrderType string  `json:"order_type"`
	Locale    string  `json:"locale"`
}

type PaymentResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	URL     string `json:"url"`
}

type PaymentResult struct {
	VnpAmount        float64 `json:"vnp_Amount" form:"vnp_Amount"`
	VnpBankCode      string  `json:"vnp_BankCode" form:"vnp_BankCode"`
	VnpOrderInfo     string  `json:"vnp_OrderInfo" form:"vnp_OrderInfo"`
	VnpResponseCode  string  `json:"vnp_ResponseCode" form:"vnp_ResponseCode"`
	VnpTxnRef        string  `json:"vnp_TxnRef" form:"vnp_TxnRef"`
	VnpTransactionNo string  `json:"vnp_TransactionNo" form:"vnp_TransactionNo"`
	VnpSecureHash    string  `json:"vnp_SecureHash" form:"vnp_SecureHash"`
}

// Config VNPay
type VNPayConfig struct {
	TmnCode    string
	HashSecret string
	ReturnURL  string
	PaymentURL string
	Version    string
	Command    string
	CurrCode   string
	Locale     string
	VNPIpnUrl  string
}

func GetVNPayConfig() VNPayConfig {
	return VNPayConfig{
		TmnCode:    "TR2HAPVB",                         // Thay bằng TMN Code của bạn
		HashSecret: "RMGXLFVTRAIVM07GJ0QIOOAEXDPAQ32B", // Thay bằng Hash Secret của bạn
		ReturnURL:  "http://localhost:5173/payment/result",
		PaymentURL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
		Version:    "2.1.0",
		Command:    "pay",
		CurrCode:   "VND",
		Locale:     "vn",
	}
}

type Payment struct {
	Id             int64     `json:"-" db:"id"`
	FakeId         string    `json:"id" db:"-"`
	InvoiceId      int64     `json:"-" db:"invoice_id"`
	FakeInvoiceId  string    `json:"invoice_id" db:"-"`
	Amount         float64   `json:"amount" db:"amount"`
	PaymentGateway *string   `json:"payment_gateway,omitempty" db:"payment_gateway"`
	TransactionId  *string   `json:"transaction_id,omitempty" db:"transaction_id"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

func (p *Payment) Mask() {

	uid_i := uid.NewUID(uint32(p.Id), 5).ToBase58()
	p.FakeId = uid_i

	uid_inv := uid.NewUID(uint32(p.Id), 4).ToBase58()
	p.FakeInvoiceId = uid_inv
}
