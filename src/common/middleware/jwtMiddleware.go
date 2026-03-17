package middleware

import (
	"net/http"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"

	"github.com/gin-gonic/gin"
)

func JwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("travel_assistant_token")
		if err != nil {
			Response.Error(c, http.StatusUnauthorized, "未登录")
			c.Abort()
			return
		}
		verify := config.SecurityUtils.VerifyToken(token)
		if !verify {
			Response.Error(c, http.StatusUnauthorized, "未登录")
			c.Abort()
			return
		}
		claims := config.SecurityUtils.GetTokenClaims(token)
		c.Set("userId", claims["id"])
		c.Set("userName", claims["username"])
		c.Next()
	}
}
