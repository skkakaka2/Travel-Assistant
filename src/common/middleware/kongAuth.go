package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"travel-assistant/src/common/Response"

	"github.com/gin-gonic/gin"
)

// KongAuth 从 Kong 网关传递的 Header 中获取用户信息
// Kong JWT 插件验证通过后，会将用户信息通过 Header 传递给后端
func KongAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Kong 传递的消费者 ID（表示已认证）
		consumerID := c.GetHeader("X-Consumer-ID")
		if consumerID == "" {
			// 也可以检查 X-Anonymous-Consumer 来判断是否是匿名访问
			Response.Error(c, http.StatusUnauthorized, "未认证，请提供有效的 JWT Token")
			c.Abort()
			return
		}

		// 从 Kong 传递的自定义声明中获取用户 ID
		// 需要在 Kong JWT 插件中配置 claims_to_verify 和 header_claims
		userIDStr := c.GetHeader("X-User-ID")
		if userIDStr == "" {
			// 如果没有自定义 Header，尝试从 JWT 的 sub claim 获取
			// Kong 默认会将 JWT 的 payload 通过 X-JWT-Claim-* 头传递
			userIDStr = c.GetHeader("X-JWT-Claim-Sub")
		}

		if userIDStr == "" {
			Response.Error(c, http.StatusUnauthorized, "无法获取用户 ID")
			c.Abort()
			return
		}

		// 转换 userID 为 uint
		userID, err := strconv.ParseUint(strings.TrimSpace(userIDStr), 10, 64)
		if err != nil {
			Response.Error(c, http.StatusUnauthorized, "用户 ID 格式无效")
			c.Abort()
			return
		}

		// 获取用户名（可选）
		userName := c.GetHeader("X-User-Name")
		if userName == "" {
			userName = c.GetHeader("X-JWT-Claim-Name")
		}

		// 将用户信息存入 Gin Context，供后续使用
		c.Set("userId", uint(userID))
		c.Set("userName", userName)
		c.Set("consumerId", consumerID)

		c.Next()
	}
}
