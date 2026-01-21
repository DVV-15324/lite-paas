package composer

import (
	"context"
	"github.com/joho/godotenv"
	_ "github.com/microsoft/go-mssqldb"
	apiWebhook "lite-paas/infrastructure/github/webhook"
	bzAuth "lite-paas/modules/auths/business"
	responsitoryAuth "lite-paas/modules/auths/reponsitory"
	apiAuth "lite-paas/modules/auths/transport/api"
	bzDatabase "lite-paas/modules/database/business"
	responsitoryDatabase "lite-paas/modules/database/reponsitory"
	apiDatabase "lite-paas/modules/database/transport/api"
	bzDatabaseEnv "lite-paas/modules/database_env/business"
	responsitoryDatabaseEnv "lite-paas/modules/database_env/reponsitory"
	apiDatabaseEnv "lite-paas/modules/database_env/transport/api"
	bzDatabaseSub "lite-paas/modules/database_sub/business"
	responsitoryDatabasSub "lite-paas/modules/database_sub/reponsitory"
	apiDatabasSub "lite-paas/modules/database_sub/transport/api"
	bzInvoice "lite-paas/modules/invoices/business"
	responsitoryInvoice "lite-paas/modules/invoices/reponsitory"
	apiInvoice "lite-paas/modules/invoices/transport/api"
	bzPayment "lite-paas/modules/payments/business"
	responsitoryPayment "lite-paas/modules/payments/reponsitory"
	apiPayment "lite-paas/modules/payments/transport/api"
	bzRuntimeEnv "lite-paas/modules/runtime_env/business"
	responsitoryRuntimeEnv "lite-paas/modules/runtime_env/reponsitory"
	apiRuntimeEnv "lite-paas/modules/runtime_env/transport/api"
	bzRuntimeSub "lite-paas/modules/runtime_sub/business"
	responsitoryRuntimeSub "lite-paas/modules/runtime_sub/reponsitory"
	apiRuntimeSub "lite-paas/modules/runtime_sub/transport/api"
	bzRuntime "lite-paas/modules/runtimes/business"
	responsitoryRuntime "lite-paas/modules/runtimes/reponsitory"
	apiRuntime "lite-paas/modules/runtimes/transport/api"
	bzUser "lite-paas/modules/users/business"
	responsitoryUser "lite-paas/modules/users/reponsitory"
	apiUser "lite-paas/modules/users/transport/api"
	connectdb "lite-paas/shared/db"
	c_hash "lite-paas/shared/hash"
	c_jwt "lite-paas/shared/jwt"

	"log"

	"github.com/gin-gonic/gin"
)

type BzAuth interface {
	BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error)
}

type ApiAuth interface {
	ApiLoginAuth() func(c *gin.Context)
	ApiRegisterAuth() func(c *gin.Context)
	ApiAuthBanned() func(c *gin.Context)
}
type ApiUser interface {
	ApiGetUserById() func(c *gin.Context)
	ApiGetUserAll() func(c *gin.Context)
}

type ApiRuntime interface {
	ApiCreateRuntime() func(c *gin.Context)
	ApiGetAllRuntime() func(c *gin.Context)
}

type ApiDatabase interface {
	ApiCreateDatabase() func(c *gin.Context)
	ApiGetAllDatabase() func(c *gin.Context)
}

type ApiRuntimeEnv interface {
	ApiCreateRuntimeEnv() func(c *gin.Context)
}

type ApiDatabaseEnv interface {
	ApiCreateDatabaseEnv() func(c *gin.Context)
}

type ApiPayment interface {
	ApiPaymentIPN() func(c *gin.Context)
	ApiCreateUrlPayment() func(c *gin.Context)
}

type ApiRuntimeSub interface {
	UpdateRuntimeSub() func(c *gin.Context)
	GetRuntimeSubsByUser() func(c *gin.Context)
	ApiGetRuntimeSubsById() func(c *gin.Context)
	ApiGetRuntimeSubsAll() func(c *gin.Context)
}

type ApiDatabaseSub interface {
	ApiGetDatabaseSubsByUser() func(c *gin.Context)
	ApiGetDatabaseSubsById() func(c *gin.Context)
	ApiGetDatabaseSubsAll() func(c *gin.Context)
}

type ApiInvoice interface {
	ApiCreateInvoice() func(c *gin.Context)
	ApiGetInvoiceByID() func(c *gin.Context)
	ApiListInvoicesByUser() func(c *gin.Context)
	ApiUpdateInvoiceStatus() func(c *gin.Context)
	ApiGetInvoiceAll() func(c *gin.Context)
}
type ApiWebhook interface {
	ReceiveWebhook() func(c *gin.Context)
}

// dependency
type ApiServer struct {
	BzAuth         BzAuth
	ApiDatabaseEnv ApiDatabaseEnv
	ApiRuntimeEnv  ApiRuntimeEnv
	ApiAuth        ApiAuth
	ApiUser        ApiUser
	ApiPayment     ApiPayment
	ApiRuntime     ApiRuntime
	ApiDatabase    ApiDatabase
	ApiInvoice     ApiInvoice
	ApiRuntimeSub  ApiRuntimeSub
	ApiDatabaseSub ApiDatabaseSub
	ApiWebhook     ApiWebhook
}

func ComposerService() *ApiServer {
	db, _ := connectdb.Connectdb()
	err := godotenv.Load()
	if err != nil {
		log.Println("loi load .env")
	}

	// Khởi tạo logs handler
	rRuntime := responsitoryRuntime.NewRuntimeServiceSQL(db)
	rAuth := responsitoryAuth.NewAuthServiceSQL(db)
	rUser := responsitoryUser.NewUserServiceSQL(db)
	rDatabase := responsitoryDatabase.NewDatabaseServiceSQL(db)
	rInvoice := responsitoryInvoice.NewInvoiceServiceSQL(db)
	rPayment := responsitoryPayment.NewPaymentServiceSQL(db)
	rRuntimeSub := responsitoryRuntimeSub.NewSubscriptionServiceSQL(db)
	rDatabaseSub := responsitoryDatabasSub.NewDatabaseSubServiceSQL(db)
	rRuntimeEnv := responsitoryRuntimeEnv.NewRuntimeEnvSeviceSQL(db)
	rDatabaseEnv := responsitoryDatabaseEnv.NewDatabaseEnvServiceSQL(db)
	// business
	jwt := c_jwt.NewJwtServer("vu-dep-trai-nhat-the-gioi", 604800)
	hash := new(c_hash.Hash)
	bzUser := bzUser.NewBusinessUser(rUser)
	bzAuth := bzAuth.NewBusinessAuth(jwt, bzUser, hash, rAuth)
	bzRuntime := bzRuntime.NewBussinessRuntime(rRuntime)
	bzDatabase := bzDatabase.NewBussinessDatabase(rDatabase)
	bzRuntimeEnv := bzRuntimeEnv.NewBusinessRuntimeEnv(rRuntimeEnv)
	bzDatabaseEnv := bzDatabaseEnv.NewBusinessDatabaseEnv(rDatabaseEnv)
	bzInvoice := bzInvoice.NewBussinessInvoice(rInvoice, bzRuntime, bzDatabase, bzUser)
	bzDatabaseSub := bzDatabaseSub.NewBussinessDatabaseSub(rDatabaseSub, bzUser, bzDatabase)
	bzRuntimeSub := bzRuntimeSub.NewRuntimeSubBusiness(rRuntimeSub, bzUser, bzRuntime, bzRuntimeEnv)
	bzPayment := bzPayment.NewBussinessPayment(rPayment)

	// api
	apiUser := apiUser.NewApiUser(bzUser)
	apiAuth := apiAuth.NewApiAuth(bzAuth)
	apiRuntime := apiRuntime.NewApiRuntime(bzRuntime)
	apiDatabase := apiDatabase.NewApiDatabase(bzDatabase)
	apiInvoice := apiInvoice.NewApiInvoice(bzInvoice)
	apiPayment := apiPayment.NewApiPayment(bzPayment, bzRuntimeSub, bzInvoice, bzUser, bzDatabaseSub, bzDatabase, bzDatabaseEnv)
	apiRuntimeSub := apiRuntimeSub.NewApiRuntimeSub(bzRuntimeSub)
	apiDatabaseSub := apiDatabasSub.NewApiDatabaseSub(bzDatabaseSub)
	apiRuntimeEnv := apiRuntimeEnv.NewApiDatabaseEnv(bzRuntimeEnv)
	apiDatabaseEnv := apiDatabaseEnv.NewApiDatabaseEnv(bzDatabaseEnv)
	apiWebhook := apiWebhook.NewWebhookHandler(bzRuntimeSub)
	return &ApiServer{
		BzAuth:         bzAuth,
		ApiDatabaseEnv: apiDatabaseEnv,
		ApiRuntimeEnv:  apiRuntimeEnv,
		ApiAuth:        apiAuth,
		ApiUser:        apiUser,
		ApiRuntime:     apiRuntime,
		ApiDatabase:    apiDatabase,
		ApiInvoice:     apiInvoice,
		ApiPayment:     apiPayment,
		ApiRuntimeSub:  apiRuntimeSub,
		ApiDatabaseSub: apiDatabaseSub,
		ApiWebhook:     apiWebhook,
	}
}
