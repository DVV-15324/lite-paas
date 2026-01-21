package payment

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	qr "lite-paas/modules/payments/entity"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"k8s.io/apimachinery/pkg/util/rand"
)

func (a *ApiPayment) ApiCreateUrlPayment() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req qr.PaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, qr.PaymentResponse{
				Code:    "01",
				Message: "Dữ liệu không hợp lệ: " + err.Error(),
			})
			return
		}

		// Validate amount
		if req.Amount < 1000 {
			c.JSON(http.StatusBadRequest, qr.PaymentResponse{
				Code:    "02",
				Message: "Số tiền phải lớn hơn 1,000 VND",
			})
			return
		}

		if req.Amount > 500000000 {
			c.JSON(http.StatusBadRequest, qr.PaymentResponse{
				Code:    "03",
				Message: "Số tiền không được vượt quá 500,000,000 VND",
			})
			return
		}

		paymentURL, err := generatePaymentURL(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, qr.PaymentResponse{
				Code:    "04",
				Message: "Lỗi tạo URL thanh toán: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, qr.PaymentResponse{
			Code:    "00",
			Message: "Thành công",
			URL:     paymentURL,
		})
	}
}
func generatePaymentURL(req qr.PaymentRequest) (string, error) {
	config := qr.GetVNPayConfig()
	params := make(url.Values)

	// Convert amount to VNPay format (multiply by 100)
	amount := int(req.Amount * 100)

	// Tạo vnpTxnRef ngẫu nhiên dựa trên thời gian
	vnpTxnRef := generateRandomTxnRef()
	createDate := time.Now().Format("20060102150405")

	// Add required parameters
	params.Add("vnp_Version", config.Version)
	params.Add("vnp_Command", config.Command)
	params.Add("vnp_TmnCode", config.TmnCode)
	params.Add("vnp_Amount", strconv.Itoa(amount))
	params.Add("vnp_CurrCode", config.CurrCode)
	params.Add("vnp_TxnRef", vnpTxnRef)
	params.Add("vnp_OrderInfo", req.OrderInfo)
	params.Add("vnp_OrderType", req.OrderType)
	params.Add("vnp_Locale", req.Locale)
	params.Add("vnp_ReturnUrl", config.ReturnURL)
	params.Add("vnp_IpAddr", "127.0.0.1")
	params.Add("vnp_CreateDate", createDate)

	if req.BankCode != "" {
		params.Add("vnp_BankCode", req.BankCode)
	}

	// Sort parameters alphabetically
	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Create hash data string
	var hashData strings.Builder
	for i, k := range keys {
		if i > 0 {
			hashData.WriteString("&")
		}
		hashData.WriteString(k + "=" + url.QueryEscape(params.Get(k)))
	}

	// Create secure hash using HMAC SHA512
	hmac := hmac.New(sha512.New, []byte(config.HashSecret))
	hmac.Write([]byte(hashData.String()))
	secureHash := hex.EncodeToString(hmac.Sum(nil))

	// Add secure hash to parameters
	params.Add("vnp_SecureHash", secureHash)

	// Create final payment URL
	paymentURL := config.PaymentURL + "?" + params.Encode()

	fmt.Printf("  Tạo URL thanh toán thành công:\n")
	fmt.Printf("   - OrderID: %s\n", req.OrderID)
	fmt.Printf("   - vnpTxnRef: %s\n", vnpTxnRef)
	fmt.Printf("   - Amount: %.0f VND\n", req.Amount)
	fmt.Printf("   - Bank: %s\n", req.BankCode)

	return paymentURL, nil
}

// generateRandomTxnRef tạo mã giao dịch ngẫu nhiên dựa trên thời gian
func generateRandomTxnRef() string {
	// Lấy thời gian hiện tại dưới dạng số (nano seconds)
	timestamp := time.Now().UnixNano()

	// Tạo số ngẫu nhiên để đảm bảo tính duy nhất
	random := rand.Intn(10000) // số ngẫu nhiên từ 0-9999

	// Kết hợp timestamp và số ngẫu nhiên
	// Format: TIMESTAMP_RANDOM
	return fmt.Sprintf("%d%d", timestamp, random)
}
