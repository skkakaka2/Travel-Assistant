package router

import (
	"travel-assistant/src/common/middleware"
	activityService "travel-assistant/src/modules/activity/service"
	tripService "travel-assistant/src/modules/trip/service"
	userService "travel-assistant/src/modules/user/service"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api/v1")

	userGroup := api.Group("user")
	{
		userGroup.POST("register", userService.Register)
		userGroup.POST("login", userService.Login)
		userGroup.PUT("update", middleware.JwtMiddleware(), userService.UpdateUser)
	}
	tripGroup := api.Group("trip", middleware.JwtMiddleware())
	{
		tripGroup.POST("create", tripService.CreateTrip)
		tripGroup.GET("get", tripService.GetTripByPagination)
		tripGroup.PUT("update", tripService.UpdateTrip)
		tripGroup.DELETE("delete", tripService.DeleteTrip)
	}
	activityGroup := api.Group("activity", middleware.JwtMiddleware())
	{
		activityGroup.POST("create", activityService.CreateActivity)
		activityGroup.GET("list", activityService.GetActivities)
		activityGroup.PUT("update", activityService.UpdateActivity)
		activityGroup.DELETE("delete", activityService.DeleteActivity)
	}

	return router
}
