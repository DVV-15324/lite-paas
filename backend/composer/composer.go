package composer

import (
	"context"
	connectdb "lite-paas/common/DB"
	c_hash "lite-paas/common/hash"
	c_jwt "lite-paas/common/jwt"
	bzAuth "lite-paas/services/business/auth"
	bzInvoice "lite-paas/services/business/invoice"
	bzPayment "lite-paas/services/business/payment"
	bzRuntime "lite-paas/services/business/runtime"
	bzRuntimeSub "lite-paas/services/business/runtime_sub"
	bzStorage "lite-paas/services/business/storage"
	bzStorageSub "lite-paas/services/business/storage_sub"
	bzSupportTicket "lite-paas/services/business/support_ticket"
	bzTicketMessage "lite-paas/services/business/ticket_message"
	bzUser "lite-paas/services/business/user"
	entityAuth "lite-paas/services/entity/auth"
	responsitoryAuth "lite-paas/services/reponsitory/auth"
	responsitoryInvoice "lite-paas/services/reponsitory/invoice"
	responsitoryPayment "lite-paas/services/reponsitory/payment"
	responsitoryRuntime "lite-paas/services/reponsitory/runtime"
	responsitoryRuntimeSub "lite-paas/services/reponsitory/runtime_sub"
	responsitoryStorage "lite-paas/services/reponsitory/storage"
	responsitoryStorageSub "lite-paas/services/reponsitory/storage_sub"
	responsitorySupportTicket "lite-paas/services/reponsitory/support_ticket"
	responsitoryTicketMessage "lite-paas/services/reponsitory/ticket_message"
	responsitoryUser "lite-paas/services/reponsitory/user"
	apiAuth "lite-paas/services/transport/api/auth"
	apiInvoice "lite-paas/services/transport/api/invoice"
	apiLogPods "lite-paas/services/transport/api/logpods"
	apiMetrics "lite-paas/services/transport/api/mestrics"
	apiPayment "lite-paas/services/transport/api/payment"
	apiRuntime "lite-paas/services/transport/api/runtime"
	apiRuntimeSub "lite-paas/services/transport/api/runtime_sub"
	apiStorage "lite-paas/services/transport/api/storage"
	apiStorageSub "lite-paas/services/transport/api/storage_sub"
	apiSupportTicket "lite-paas/services/transport/api/support_ticket"
	apiTicketMessage "lite-paas/services/transport/api/ticket_message"
	apiUser "lite-paas/services/transport/api/user"

	hub "lite-paas/common/hub"

	"log"

	"github.com/joho/godotenv"
	_ "github.com/microsoft/go-mssqldb"

	"os"

	"github.com/gin-gonic/gin"
	k8sMestrics "lite-paas/k8s-service/k8s-manager/mestrics"
	k8sLogsPod "lite-paas/k8s-service/k8s-manager/runtime"
)

type BzIntroSpectToken interface {
	BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error)
}
type ApiAuth interface {
	ApiLoginAuth() func(c *gin.Context)
	ApiRegisterAuth() func(c *gin.Context)
	ApiGoogleLogin() func(c *gin.Context)
	ApiAuthForget() func(c *gin.Context)
	ApiAuthChange() func(c *gin.Context)
}
type ApiUser interface {
	ApiGetUserById() func(c *gin.Context)
	ApiUpdateUser() func(c *gin.Context)
	ApiGetUserByIdPublic() func(c *gin.Context)
}

type ApiPayment interface {
	ApiPaymentIPN() func(c *gin.Context)
	ApiCreateUrlPayment() func(c *gin.Context)
	HealthCheck() func(c *gin.Context)
}
type ApiRuntime interface {
	ApiCreateRuntime() func(c *gin.Context)
	ApiGetAllRuntime() func(c *gin.Context)
	ApiUpdateRuntime() func(c *gin.Context)
}
type ApiRuntimeSub interface {
	UpdateRuntimeSub() func(c *gin.Context)
	GetRuntimeSubsByUser() func(c *gin.Context)
	ApiGetRuntimeSubsById() func(c *gin.Context)
}
type ApiStorageSub interface {
	GetStorageSubsByUser() func(c *gin.Context)
	ApiGetStorageSubsById() func(c *gin.Context)
}
type ApiStorage interface {
	ApiCreateStorage() func(c *gin.Context)
	ApiGetAllStorage() func(c *gin.Context)
	ApiUpdateStorage() func(c *gin.Context)
}

type ApiInvoice interface {
	ApiCreateInvoice() func(c *gin.Context)
	ApiGetInvoiceByID() func(c *gin.Context)
	ApiListInvoicesByUser() func(c *gin.Context)
	ApiUpdateInvoiceStatus() func(c *gin.Context)
}

type ApiSupportTicket interface {
	ApiCreateNewTicket() func(c *gin.Context)
	ApiUpdateTicket() func(c *gin.Context)
	ApiGetTicketsByUserID() func(c *gin.Context)
}

type ApiTicketMessage interface {
	ApiGetMessagesByTicket() func(c *gin.Context)
}
type ApiMestrics interface {
	ApiGetRamCpu() func(c *gin.Context)
	ApiGetRamStorage() func(c *gin.Context)
}
type ApiLogPod interface {
	ApiGetAppLogs() func(c *gin.Context)
}
type ApiServer struct {
	BzIntrospect     BzIntroSpectToken
	ApiMestrics      ApiMestrics
	ApiAuth          ApiAuth
	ApiUser          ApiUser
	ApiPayment       ApiPayment
	ApiRuntime       ApiRuntime
	ApiStorage       ApiStorage
	ApiInvoice       ApiInvoice
	ApiRuntimeSub    ApiRuntimeSub
	ApiStorageSub    ApiStorageSub
	ApiSupportTicket ApiSupportTicket
	ApiTicketMessage ApiTicketMessage
	ServiceHub       *hub.ServiceHub
	ChatHub          *hub.TicketHub
	ApilogsPod       ApiLogPod
}

func ComposerService() *ApiServer {
	db, _ := connectdb.Connectdb()
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using default or env vars")
	}
	cfg := &entityAuth.Config{
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
	}
	ServiceHub := hub.NewServiceHub()
	go ServiceHub.Run()
	ChatHub := hub.NewTicketHub()
	go ChatHub.Run()
	k8s, _ := k8sMestrics.NewK8sManagerMetrics("./k8s-service/config.yaml")
	k8sManager, _ := k8sLogsPod.NewK8sManagerRuntime("user", "example.com", "./k8s-service/config.yaml", ServiceHub)

	// Khởi tạo logs handler

	rRuntime := responsitoryRuntime.NewRuntimeServiceSQL(db)
	rAuth := responsitoryAuth.NewAuthServiceSQL(db)
	rUser := responsitoryUser.NewUserServiceSQL(db)
	rStorage := responsitoryStorage.NewStorageServiceSQL(db)
	rInvoice := responsitoryInvoice.NewInvoiceServiceSQL(db)
	rPayment := responsitoryPayment.NewPaymentServiceSQL(db)
	rRuntimeSub := responsitoryRuntimeSub.NewSubscriptionServiceSQL(db)
	rStorageSub := responsitoryStorageSub.NewSubscriptionServiceSQL(db)
	rSupportTicket := responsitorySupportTicket.NewSupportTicketServiceSQL(db)
	rTicketMessage := responsitoryTicketMessage.NewTicketReplyServiceSQL(db)
	// business
	jwt := c_jwt.NewJwtServer("vu-dep-trai-nhat-the-gioi", 604800)
	hash := new(c_hash.Hash)

	bzUser := bzUser.NewBusinessUser(rUser)
	bzAuth := bzAuth.NewBusinessAuth(jwt, bzUser, hash, rAuth, cfg)
	bzRuntime := bzRuntime.NewBussinessRuntime(rRuntime)
	bzStorage := bzStorage.NewBussinessStorage(rStorage)
	bzInvoice := bzInvoice.NewBussinessInvoice(rInvoice, bzRuntime, bzStorage, bzUser)
	bzStorageSub := bzStorageSub.NewBussinessStorage(rStorageSub, bzUser, bzStorage)
	bzRuntimeSub := bzRuntimeSub.NewRuntimeSubBusiness(rRuntimeSub, ServiceHub, bzUser, bzRuntime)
	bzPayment := bzPayment.NewBussinessPayment(rPayment, bzInvoice, bzRuntimeSub)
	bzSupportTicket := bzSupportTicket.NewBussinessSuportTicket(rSupportTicket)
	bzTicketMessage := bzTicketMessage.NewBussinessTickMessage(rTicketMessage)
	// api
	apiUser := apiUser.NewApiUser(bzUser)
	apiAuth := apiAuth.NewApiAuth(bzAuth)
	apiRuntime := apiRuntime.NewApiRuntime(bzRuntime)
	apiStorage := apiStorage.NewApiStorage(bzStorage)
	apiInvoice := apiInvoice.NewApiInvoice(bzInvoice)
	apiPayment := apiPayment.NewApiPayment(bzPayment, bzRuntimeSub, bzInvoice, ServiceHub, bzUser, bzStorageSub, bzStorage)
	apiRuntimeSub := apiRuntimeSub.NewApiRuntimeSub(bzRuntimeSub)
	apiStorageSub := apiStorageSub.NewApiStorageSub(bzStorageSub)
	apiSupportTicket := apiSupportTicket.NewApiSupportTicket(bzSupportTicket)
	apiTicketMessage := apiTicketMessage.NewApiTicketMessage(bzTicketMessage)
	apiMetrics := apiMetrics.NewApiMestrics(k8s, bzUser)
	logsHandler := apiLogPods.NewLogsHandler(k8sManager)
	return &ApiServer{
		BzIntrospect:     bzAuth,
		ApiAuth:          apiAuth,
		ApiUser:          apiUser,
		ApiRuntime:       apiRuntime,
		ApiStorage:       apiStorage,
		ApiInvoice:       apiInvoice,
		ApiPayment:       apiPayment,
		ServiceHub:       ServiceHub,
		ChatHub:          ChatHub,
		ApiSupportTicket: apiSupportTicket,
		ApiTicketMessage: apiTicketMessage,
		ApiRuntimeSub:    apiRuntimeSub,
		ApiStorageSub:    apiStorageSub,
		ApiMestrics:      apiMetrics,
		ApilogsPod:       logsHandler,
	}
}
