package cmd

import (
	"lite-paas/composer"
	"lite-paas/middleware"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/spf13/cobra"
)

var root = &cobra.Command{
	Use:   "start",
	Short: "Bắt đầu khởi động phần mềm",
	Run: func(cmd *cobra.Command, args []string) {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("loi loading .env file")
		}
		g := gin.Default()
		g.Use(middleware.Cors())
		StartService(g)
		g.Run(":3000")
	},
}

func StartService(r *gin.Engine) {
	comp := composer.ComposerService()

	//r.POST("/webhook", webhook.NewWebhookHandler().ReceiveWebhook())
	r.GET("/health", func(c *gin.Context) { c.String(200, "OK") })
	r.GET("/service/:id", func(c *gin.Context) {
		serviceId := c.Param("id")
		comp.ServiceHub.HandleServiceWS(c.Writer, c.Request, serviceId)
	})
	r.POST("/apps/:serviceId/logs/:appName", comp.ApilogsPod.ApiGetAppLogs())
	v1 := r.Group("v1")
	v1.Use(middleware.Cors())
	//auth
	auth := v1.Group("auth")
	auth.POST("/login", comp.ApiAuth.ApiLoginAuth())
	auth.POST("/google", comp.ApiAuth.ApiGoogleLogin())
	auth.POST("/register", comp.ApiAuth.ApiRegisterAuth())
	auth.POST("/forgot_password", comp.ApiAuth.ApiAuthForget())
	v3 := r.Group("v3")
	v3.Use(middleware.Cors())
	authV3 := v3.Group("auth")
	authV3.Use(middleware.RequiredAuthQuery(comp.BzIntrospect))
	authV3.POST("/reset_password", comp.ApiAuth.ApiAuthChange())

	auth.POST("/reset_password", comp.ApiAuth.ApiAuthChange()).Use(middleware.RequiredAuthQuery(comp.BzIntrospect))
	userV1 := v1.Group("user")
	userV1.POST("/get_user_id_p/:id", comp.ApiUser.ApiGetUserByIdPublic())

	runtimeV1 := v1.Group("runtime")
	runtimeV1.POST("/", comp.ApiRuntime.ApiGetAllRuntime())

	storageV1 := v1.Group("storage")
	storageV1.POST("/", comp.ApiStorage.ApiGetAllStorage())

	v2 := r.Group("v2")
	v2.Use(middleware.Cors())

	authV2 := v2.Group("auth").Use(middleware.RequiredAuth(comp.BzIntrospect))
	authV2.POST("/change_password", comp.ApiAuth.ApiAuthChange())

	userV2 := v2.Group("user").Use(middleware.RequiredAuth(comp.BzIntrospect))
	userV2.POST("/get_user_id", comp.ApiUser.ApiGetUserById())
	userV2.POST("/update_user_id", comp.ApiUser.ApiUpdateUser())

	r.POST("/api/payment/create", comp.ApiPayment.ApiCreateUrlPayment())
	r.GET("/api/payment/ipn", comp.ApiPayment.ApiPaymentIPN())
	// Utility routes
	r.GET("/api/health", comp.ApiPayment.HealthCheck())
	runtimeV2 := v2.Group("runtime").Use(middleware.RequiredAuth(comp.BzIntrospect))
	runtimeV2.POST("/", comp.ApiRuntime.ApiCreateRuntime())
	runtimeV2.PUT("/:id", comp.ApiRuntime.ApiUpdateRuntime())

	storageV2 := v2.Group("storage").Use(middleware.RequiredAuth(comp.BzIntrospect))
	storageV2.POST("/", comp.ApiStorage.ApiCreateStorage())
	storageV2.PUT("/:id", comp.ApiStorage.ApiUpdateStorage())

	invoiceV2 := v2.Group("invoice").Use(middleware.RequiredAuth(comp.BzIntrospect))
	invoiceV2.POST("/", comp.ApiInvoice.ApiCreateInvoice())
	invoiceV2.POST("/:id", comp.ApiInvoice.ApiGetInvoiceByID())
	invoiceV2.POST("/user", comp.ApiInvoice.ApiListInvoicesByUser())
	invoiceV2.POST("/update", comp.ApiInvoice.ApiUpdateInvoiceStatus())

	subRuntimeV2 := v2.Group("sub-runtime").Use(middleware.RequiredAuth(comp.BzIntrospect))
	subRuntimeV2.POST("/user", comp.ApiRuntimeSub.GetRuntimeSubsByUser())
	subRuntimeV2.POST("/:id", comp.ApiRuntimeSub.ApiGetRuntimeSubsById())
	subRuntimeV2.POST("/:id/deploy", comp.ApiRuntimeSub.UpdateRuntimeSub())

	subStorageV2 := v2.Group("sub-storage").Use(middleware.RequiredAuth(comp.BzIntrospect))
	subStorageV2.POST("/user", comp.ApiStorageSub.GetStorageSubsByUser())
	subStorageV2.POST("/:id", comp.ApiStorageSub.ApiGetStorageSubsById())

	supportTicketV2 := v2.Group("support-ticket").Use(middleware.RequiredAuth(comp.BzIntrospect))
	supportTicketV2.POST("/:subid", comp.ApiSupportTicket.ApiCreateNewTicket())
	supportTicketV2.POST("/", comp.ApiSupportTicket.ApiGetTicketsByUserID())
	supportTicketV2.POST("/update", comp.ApiSupportTicket.ApiUpdateTicket())

	ticketMesageV2 := v2.Group("ticket-message").Use(middleware.RequiredAuth(comp.BzIntrospect))
	ticketMesageV2.POST("/:id", comp.ApiTicketMessage.ApiGetMessagesByTicket())

	ticketMesageV1 := v1.Group("ticket-message")
	ticketMesageV1.GET("/ws", func(c *gin.Context) {
		log.Printf("[ROUTE DEBUG] WebSocket route called - URL: %s", c.Request.URL.String())
		middleware.RequiredAuthAny(comp.BzIntrospect)(c)
		if !c.IsAborted() {
			log.Printf("[ROUTE DEBUG] Authentication passed, proceeding to WebSocket")
			comp.ChatHub.HandleTicketWS(c.Writer, c.Request)
		} else {
			log.Printf("[ROUTE DEBUG] Authentication failed or aborted")
		}
	}).Use((middleware.RequiredAuthAny(comp.BzIntrospect)))

	mestricsV2 := v2.Group("mestrics").Use(middleware.RequiredAuth(comp.BzIntrospect))
	mestricsV2.POST("/:id/:type", comp.ApiMestrics.ApiGetRamStorage())
	mestricsV2.POST("/:id", comp.ApiMestrics.ApiGetRamCpu())

	admin := r.Group("admin")
	adminSubStorage := admin.Group("sub-storage")
	adminSubStorage.POST("/all", comp.ApiStorageSub.ApiGetStorageSubsAll())
	adminSubRuntime := admin.Group("sub-runtime")
	adminSubRuntime.POST("/all", comp.ApiRuntimeSub.ApiGetRuntimeSubsAll())
	adminUser := admin.Group("user")
	adminUser.POST("/all", comp.ApiUser.ApiGetUserAll())
	adminInvoice := admin.Group("invoice")
	adminInvoice.POST("/all", comp.ApiInvoice.ApiGetInvoiceAll())
	adminSupportTicket := admin.Group("support-ticket")
	adminSupportTicket.POST("/all", comp.ApiSupportTicket.ApiGetTicketsAll())
	adminSupportTicket.POST("/:id", comp.ApiSupportTicket.ApiUpdateTicket())
	adminStop := admin.Group("stop")
	adminStop.POST("/apps/:namespace/logs/:appName", comp.ApiStop.ApiStopApp())
	adminStart := admin.Group("start")
	adminStart.POST("/apps/:namespace/logs/:appName", comp.ApiStop.ApiStartApp())
	adminStopRuntime := admin.Group("stop-runtime")
	adminStopRuntime.POST("/:id", comp.ApiRuntime.ApiUpdateRuntime())
	adminStopStarage := admin.Group("stop-storage")
	adminStopStarage.POST("/:id", comp.ApiStorage.ApiUpdateStorage())
}

func GetExcute() *cobra.Command {
	return root
}
