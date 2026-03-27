package router

import (
	"net/http"
	"travel-assistant/src/common/middleware"
	activityservice "travel-assistant/src/modules/activity/service"
	authservice "travel-assistant/src/modules/auth/service"
	tripservice "travel-assistant/src/modules/trip/service"
	userservice "travel-assistant/src/modules/user/service"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	})

	api := router.Group("/api/v1", middleware.TraceMiddleware(), middleware.NullFilterMiddleware())

	userGroup := api.Group("user")
	{
		userGroup.POST("register", userservice.Register)
		userGroup.POST("login", authservice.Login)
		userGroup.PUT("update", middleware.Auth(), userservice.UpdateUser)
	}
	tripGroup := api.Group("trip", middleware.Auth())
	{
		tripGroup.POST("create", tripservice.CreateTrip)
		tripGroup.GET("get", tripservice.GetTripByPagination)
		tripGroup.PUT("update", tripservice.UpdateTrip)
		tripGroup.DELETE("delete", tripservice.DeleteTrip)
	}
	activityGroup := api.Group("activity", middleware.Auth())
	{
		activityGroup.POST("create", activityservice.CreateActivity)
		activityGroup.GET("list", activityservice.GetActivities)
		activityGroup.PUT("update", activityservice.UpdateActivity)
		activityGroup.DELETE("delete", activityservice.DeleteActivity)
		activityGroup.POST("route/calc", activityservice.CalcActivityRoute)
	}

	return router
}
