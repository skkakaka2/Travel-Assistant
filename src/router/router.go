package router

import (
	"travel-assistant/src/common/middleware"
	userService "travel-assistant/src/modules/user/service"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	api := router.Group("/api/v1")

	userGroup := api.Group("user", middleware.JwtMiddleware())
	{
		userGroup.POST("register", userService.Register)
		userGroup.POST("login", userService.Login)
	}

	return router
}
