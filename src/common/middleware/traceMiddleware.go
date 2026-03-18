package middleware

import (
	"context"
	"travel-assistant/src/common/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func TraceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceId := generateTraceId()
		ctx := context.WithValue(c.Request.Context(), "traceId", traceId)
		c.Request = c.Request.WithContext(ctx)

		logger.Sugar.Info("请求traceId:", traceId)

		c.Next()
	}
}

func generateTraceId() string {
	return uuid.New().String()
}
