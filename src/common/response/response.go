package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type SuccessWithPageResponse[T any] struct {
	List     T
	Total    int
	Page     int
	PageSize int
}

func Success[T any](c *gin.Context, message string, data T) {
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": message,
		"data":    data,
	})
}

func SuccessWithPage[T any](c *gin.Context, message string, data SuccessWithPageResponse[T]) {
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

// BindJSON 统一处理 JSON 绑定，绑定失败时自动返回错误响应
// 返回 true 表示绑定成功，false 表示绑定失败（已自动写入错误响应）
func BindJSON(c *gin.Context, obj any) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return false
	}
	return true
}

// BindQuery 统一处理 Query 绑定，绑定失败时自动返回错误响应
// 返回 true 表示绑定成功，false 表示绑定失败（已自动写入错误响应）
func BindQuery(c *gin.Context, obj any) bool {
	if err := c.ShouldBindQuery(obj); err != nil {
		Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return false
	}
	return true
}

func BindParam(c *gin.Context, obj any) bool {
	if err := c.ShouldBind(obj); err != nil {
		Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return false
	}
	return true
}
