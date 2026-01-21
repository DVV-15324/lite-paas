package routes

import (
	"lite-paas/infrastructure/composer"

	log "lite-paas/infrastructure/k8s/k8s-manager/runtime"
	"lite-paas/middleware"
	//"log"

	"github.com/gin-gonic/gin"
)

func Start(r *gin.Engine) {
	comp := composer.ComposerService()

	// GROUP
	v1 := r.Group("v1")
	v2 := r.Group("v2")

	admin := r.Group("admin")

	//CORS
	v1.Use(middleware.Cors())
	v2.Use(middleware.Cors())

	admin.Use(middleware.Cors())

	//VNPAY
	r.POST("/api/payment/create", comp.ApiPayment.ApiCreateUrlPayment())
	r.GET("/api/payment/ipn", comp.ApiPayment.ApiPaymentIPN())
	r.GET("/apps/:id/logs/:pod", log.GetPodLogs)

	// Webhook
	r.POST("/webhook", comp.ApiWebhook.ReceiveWebhook())

	//auth
	auth := v1.Group("auth")
	auth.POST("/login", comp.ApiAuth.ApiLoginAuth())
	auth.POST("/register", comp.ApiAuth.ApiRegisterAuth())

	//runtime
	runtimeV1 := v1.Group("runtime")
	runtimeV1.POST("/get_all", comp.ApiRuntime.ApiGetAllRuntime())

	//database
	databaseV1 := v1.Group("database")
	databaseV1.POST("/get_all", comp.ApiDatabase.ApiGetAllDatabase())

	//user
	userV2 := v2.Group("user").Use(middleware.RequiredAuth(comp.BzAuth))
	userV2.POST("/get_user", comp.ApiUser.ApiGetUserById())

	//incoice
	invoiceV2 := v2.Group("invoice").Use(middleware.RequiredAuth(comp.BzAuth))
	invoiceV2.POST("/", comp.ApiInvoice.ApiCreateInvoice())
	invoiceV2.POST("/user", comp.ApiInvoice.ApiListInvoicesByUser())

	//sub-runtime
	subRuntimeV2 := v2.Group("/sub-runtime").Use(middleware.RequiredAuth(comp.BzAuth))
	subRuntimeV2.POST("/user", comp.ApiRuntimeSub.GetRuntimeSubsByUser())
	subRuntimeV2.POST("/:id", comp.ApiRuntimeSub.ApiGetRuntimeSubsById())
	subRuntimeV2.POST("/:id/deploy", comp.ApiRuntimeSub.UpdateRuntimeSub())

	//sub-database
	subDatabaseV2 := v2.Group("sub-database").Use(middleware.RequiredAuth(comp.BzAuth))
	subDatabaseV2.POST("/user", comp.ApiDatabaseSub.ApiGetDatabaseSubsByUser())
	subDatabaseV2.POST("/:id", comp.ApiDatabaseSub.ApiGetDatabaseSubsById())

	//admin/database_env
	// adminSubDatabase := admin.Group("sub-database")
	// adminSubDatabase.POST("/all", comp.ApiDatabaseSub.ApiGetDatabaseSubsAll())

	//admin/sub-runtime
	// adminSubRuntime := admin.Group("sub-runtime")
	// adminSubRuntime.POST("/all", comp.ApiRuntimeSub.ApiGetRuntimeSubsAll())

	//admin/user
	adminUser := admin.Group("user").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	adminUser.POST("/get_user_all", comp.ApiUser.ApiGetUserAll())
	adminAuth := admin.Group("auth").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	adminAuth.POST("/:id/:ban", comp.ApiAuth.ApiAuthBanned())

	//admin/invoice
	adminInvoice := admin.Group("invoice")
	adminInvoice.POST("/all", comp.ApiInvoice.ApiGetInvoiceAll())

	//admin/database
	databaseV2 := admin.Group("database").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	databaseV2.POST("/create_database", comp.ApiDatabase.ApiCreateDatabase())

	//admin/database
	RuntimeV2 := admin.Group("runtime").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	RuntimeV2.POST("/create_runtime", comp.ApiRuntime.ApiCreateRuntime())

	//admin/database
	databaseEnvV2 := admin.Group("database_env").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	databaseEnvV2.POST("/create_database_env/:id", comp.ApiDatabaseEnv.ApiCreateDatabaseEnv())

	//admin/database
	RuntimeEnvV2 := admin.Group("runtime_env").Use(middleware.RequiredAuthAdmin(comp.BzAuth))
	RuntimeEnvV2.POST("/create_runtime_env/:id", comp.ApiRuntimeEnv.ApiCreateRuntimeEnv())
}
