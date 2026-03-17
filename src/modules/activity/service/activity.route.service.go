package service

import (
	"net/http"
	"travel-assistant/src/common/Response"

	"github.com/gin-gonic/gin"
)

type CreateActivityRouteRequest struct {
	StartActivityID uint    `json:"startActivityId" binding:"required"`
	EndActivityID   uint    `json:"endActivityId" binding:"required"`
	TripID          uint    `json:"tripId" binding:"required"`
	Distance        float64 `json:"distance" binding:"required,decimal6"`
	Duration        float64 `json:"duration" binding:"required,decimal6"`
}

type UpdateActivityRouteRequest struct {
	ID uint `json:"id" binding:"required"`
	CreateActivityRouteRequest
}

// 新增活动路线
func CreateActivityRoute(c *gin.Context) {
	request := CreateActivityRouteRequest{}
	if !Response.BindJSON(c, &request) {
		Response.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

}
