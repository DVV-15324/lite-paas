package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Route chính
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Hello World!")
	})

	// Route health check
	r.GET("/healthz", func(c *gin.Context) {
		c.String(200, "OK")
	})

	port := "8080"
	log.Printf("Server starting on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
