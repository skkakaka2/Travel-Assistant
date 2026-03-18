package middleware

import (
	"travel-assistant/src/common/config"
	"travel-assistant/src/common/logger"

	"github.com/gin-gonic/gin"
)

// Auth 根据环境配置自动选择认证方式
// AUTH_MODE=kong: 使用 Kong 网关认证（生产环境）
// AUTH_MODE=jwt 或空: 使用本地 JWT 认证（开发环境）
func Auth() gin.HandlerFunc {
	authMode := config.AppConfig.Jwt.AuthMode

	switch authMode {
	case "kong":
		logger.Sugar.Info("使用 Kong 网关认证模式")
		return KongAuth()
	case "jwt", "":
		logger.Sugar.Info("使用本地 JWT 认证模式")
		return JwtMiddleware()
	default:
		logger.Sugar.Warnf("未知的认证模式: %s，默认使用 JWT", authMode)
		return JwtMiddleware()
	}
}
