package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Success[T any](c *gin.Context, message string, data T) {
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": message,
		"data":    data,
	})
}

func SuccessWithPage[T any](c *gin.Context, message string, data struct {
	List     T
	Total    int
	Page     int
	PageSize int
}) {
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": message,
		"data": gin.H{
			"list":     data.List,
			"total":    data.Total,
			"page":     data.Page,
			"pageSize": data.PageSize,
		},
	})
}

func Error(c *gin.Context, code int, message string) *gin.Context {
	c.JSON(code, gin.H{
		"code":    code,
		"message": message,
	})
	return c
}
