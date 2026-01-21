package cmd

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"lite-paas/middleware"
	"lite-paas/routes"
	"log"
)

var root = &cobra.Command{
	Use:   "root",
	Short: "Bắt đầu khởi động phần mềm",
	Run: func(cmd *cobra.Command, args []string) {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("loi loading .env file")
		}
		g := gin.Default()
		g.Use(middleware.Cors())
		routes.Start(g)
		g.Run(":3000")
	},
}

func GetExcute() *cobra.Command {
	return root
}
