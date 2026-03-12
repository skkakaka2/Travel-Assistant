package middleware

import (
	"strings"
	"travel-assistant/src/common/config"

	"github.com/gin-gonic/gin"
)

func JwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		token := strings.TrimPrefix(auth, "Bearer ")
		secret := config.AppConfig.Jwt.Secret
		println(secret)
		println(token)
		c.Next()
	}
}
