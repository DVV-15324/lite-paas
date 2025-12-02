package payment

import (
	"lite-paas/common/uid"
	c_utils "lite-paas/common/utils"

	docker "lite-paas/k8s-service/templates/docker"
	//"lite-paas/k8s-service/templates/docker"
	entityPayment "lite-paas/services/entity/payment"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"

	//entityStorageSub "lite-paas/services/entity/storage_sub"

	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	entityStorageSub "lite-paas/services/entity/storage_sub"
	"log"

	//"net/http"
	c_uid "lite-paas/common/uid"
	k8smanagerStorage "lite-paas/k8s-service/k8s-manager/storage"

	"net/url"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

func (api *ApiPayment) ApiPaymentIPN() func(c *gin.Context) {
	return func(c *gin.Context) {
		var result entityPayment.PaymentResult
		if err := c.ShouldBindQuery(&result); err != nil {
			log.Printf("Failed to bind query: %v", err)
			c.String(200, "RspCode=01&Message=INVALID_REQUEST")
			return
		}

		log.Printf("IPN received: %+v", result)

		if !verifyChecksum(c.Request.URL.Query()) {
			log.Printf("Checksum verification failed")
			c.String(200, "RspCode=97&Message=INVALID_CHECKSUM")
			return
		}
		log.Printf("Checksum verified successfully")

		// Giải mã invoiceId từ TxnRef
		invoiceId := c_uid.DecodeFromBase58(result.VnpOrderInfo)
		log.Printf("Decoded TxnRef: %s -> LocalID: %d", result.VnpOrderInfo, invoiceId.LocalID)

		if result.VnpResponseCode == "00" {
			log.Printf("Starting payment processing for invoice %d", invoiceId.LocalID)

			// Chia số tiền cho 100 (VNPay gửi số tiền đã nhân 100)
			actualAmount := result.VnpAmount / 100
			log.Printf("Amount: %d (raw: %d)", actualAmount, result.VnpAmount)

			payment := &entityPayment.CreatePayment{
				InvoiceId:      int64(invoiceId.LocalID),
				Amount:         actualAmount, // Sửa thành số tiền thực
				PaymentGateway: &result.VnpBankCode,
				TransactionID:  &result.VnpTransactionNo,
			}

			log.Printf("Attempting to save payment: %+v", payment)
			paymentID, err := api.bz.CreateNewPayment(c.Request.Context(), payment, int64(invoiceId.LocalID))
			if err != nil {
				log.Printf("CreateNewPayment failed: %v", err)
				c.String(200, "RspCode=99&Message=FAILED_SAVE_PAYMENT")
				return
			}
			log.Printf("Payment saved successfully, ID: %d", paymentID)

			// Lấy invoice
			log.Printf("Getting invoice for ID: %d", invoiceId.LocalID)

			invoice, err := api.bzInvoice.GetInvoiceByID(c, int64(invoiceId.LocalID))
			if err != nil {
				log.Printf("GetInvoiceByID failed: %v", err)
				c.String(200, "RspCode=99&Message=INVOICE_NOT_FOUND")
				return
			}
			fmt.Println(invoice.ServiceType)
			log.Printf("Invoice found: ID=%d, UserID=%d, ServiceID=%d",
				invoice.Id, invoice.UserId, invoice.ServiceID)
			err_u := api.bzInvoice.UpdateInvoiceStatus(c, int64(invoiceId.LocalID), "paid")
			if err_u != nil {
				log.Printf("UpdateInvoice failed: %v", err_u)
				c.String(200, "RspCode=99&Message=INVOICE_Faile_UPDATE")
				return
			}
			log.Printf("Invoice found: ID=%d, UserID=%d, ServiceID=%d",
				invoice.Id, invoice.UserId, invoice.ServiceID)
			// Lấy user
			log.Printf("Getting user for ID: %d", invoice.UserId)
			user, _ := api.bzUser.BzGetUsersById(c, int(invoice.UserId))

			log.Printf("User found: ID=%d, Name=%s", user.Id, user.Name)

			invoice.Mask()
			if invoice.ServiceType == "runtime" {
				// linkReturn := fmt.Sprintf("%s-%s.example.com", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), invoice.FakeId)
				// log.Printf("Generated linkReturn: %s", linkReturn)

				runtime := entityRuntimeSub.CreateRuntimeSubscription{
					//	LinkReturn: linkReturn,
					Status: true,
				}

				log.Printf("Creating runtime subscription for user %d, service %d",
					int64(user.Id), invoice.ServiceID)
				runtimeID, err := api.bzRsub.CreateNewRuntimeSub(c.Request.Context(), &runtime, int64(user.Id), invoice.ServiceID)

				if err != nil {
					log.Printf("CreateNewRuntimeSub failed: %v", err)
					c.String(200, "RspCode=99&Message=FAILED_CREATE_RUNTIME")
					return
				}

				log.Printf("Runtime subscription created, ID: %d", runtimeID)
				log.Printf("Payment process completed successfully for invoice %d!", invoiceId.LocalID)
			} else if invoice.ServiceType == "storage" {

				serviceDb, _ := api.bzStorage.GetStorageById(c, int(invoice.ServiceID))
				nameImage := strings.ToLower(serviceDb.Name)
				use_name, password, _, _ := docker.ChooseStorage(nameImage)

				storage := entityStorageSub.CreateStorageSubscription{
					UserName:   use_name,
					PassWord:   password,
					LinkReturn: "192.168.5.202",
					Status:     true,
				}
				id, portOne, portTwo, err := api.bzStoragesub.CreateNewStorageSub(c.Request.Context(), &storage, int64(user.Id), invoice.ServiceID, true)
				uid_i := uid.NewUID(uint32(id), 7).ToBase58()
				appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), uid_i)
				k8smanagerStorage.DeployDB(c_utils.SanitizeK8sName(appName), "db", nameImage, password, int32(portOne), int32(portTwo))
				if err != nil {
					log.Fatal(err)
				}

				if err != nil {
					log.Printf("CreateNewRuntimeSub failed: %v", err)
					c.String(200, "RspCode=99&Message=FAILED_CREATE_RUNTIME")
					return
				}

			} else if invoice.ServiceType == "database" {

				serviceDb, _ := api.bzStorage.GetStorageById(c, int(invoice.ServiceID))
				nameImage := strings.ToLower(serviceDb.Name)
				username, password, port, err := docker.ChooseStorage(nameImage)
				if err != nil {
					log.Fatalf("Lỗi: %v", err)
				}

				log.Printf("Config: User=%s, Port=%d, Password=%s", username, port, password)

				storage := entityStorageSub.CreateStorageSubscription{
					UserName:   username,
					PassWord:   password,
					LinkReturn: "192.168.5.202",
					Status:     true,
				}

				id, portOne, _, err := api.bzStoragesub.CreateNewStorageSub(c.Request.Context(), &storage, int64(user.Id), invoice.ServiceID, false)
				uid_i := uid.NewUID(uint32(id), 7).ToBase58()
				appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), uid_i)

				k8smanagerStorage.DeployDB(c_utils.SanitizeK8sName(appName), "db", nameImage, password, int32(portOne), 0)
				if err != nil {
					log.Fatal(err)
				}
				fmt.Println(result)

				if err != nil {
					log.Printf("CreateNewRuntimeSub failed: %v", err)
					c.String(200, "RspCode=99&Message=FAILED_CREATE_RUNTIME")
					return
				}
				log.Printf("Runtime subscription created, ID: %d", uid_i)

				log.Printf("Payment process completed successfully for invoice %d!", invoiceId.LocalID)
			}

			c.String(200, "RspCode=00&Message=Confirm Success")
		} else {
			log.Printf("Payment failed: %+v", result)
			c.String(200, "RspCode="+result.VnpResponseCode+"&Message=Payment failed")
		}
	}
}

func verifyChecksum(params url.Values) bool {
	config := entityPayment.GetVNPayConfig()

	// ✅ THÊM DEBUG LOG
	log.Printf("Using HashSecret: %s\n", config.HashSecret)

	secureHash := params.Get("vnp_SecureHash")
	params.Del("vnp_SecureHash")
	params.Del("vnp_SecureHashType")

	// Sắp xếp key alphabetically
	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Nối chuỗi hashData giống hệt lúc tạo URL
	var hashData strings.Builder
	for i, k := range keys {
		if i > 0 {
			hashData.WriteString("&")
		}
		hashData.WriteString(k + "=" + url.QueryEscape(params.Get(k)))
	}

	// ✅ THÊM DEBUG LOG
	log.Printf("Data to sign: %s", hashData.String())
	log.Printf("Received hash: %s", secureHash)

	h := hmac.New(sha512.New, []byte(config.HashSecret))
	h.Write([]byte(hashData.String()))
	expectedHash := hex.EncodeToString(h.Sum(nil))

	// ✅ THÊM DEBUG LOG
	log.Printf("Computed hash: %s", expectedHash)
	log.Printf("Hashes match: %t", strings.EqualFold(secureHash, expectedHash))

	// So sánh hash
	return strings.EqualFold(secureHash, expectedHash)
}
