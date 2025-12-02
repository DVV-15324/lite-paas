package errors

import (
	"time"

	"github.com/gin-gonic/gin"
)

type ResponseHandle struct {
	Status    int         `json:"status"`
	Message   string      `json:"message"`
	Total     int         `json:"total"`
	Error     string      `json:"error,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

func NewSuccessH(c *gin.Context, data interface{}, total ...int) {
	var r ResponseHandle
	r.Status = 200
	r.Message = "Success"
	r.Data = data
	r.Timestamp = time.Now()
	if len(total) > 0 {
		r.Total = total[0]
	} else {
		r.Total = 0
	}
	c.JSON(r.Status, r)
}

func NewErrorH(c *gin.Context, app *AppError) {
	var r ResponseHandle
	r.Status = app.Code
	r.Message = app.Message
	r.Error = app.Err.Error()
	r.Timestamp = time.Now()

	c.JSON(r.Status, r)
}
