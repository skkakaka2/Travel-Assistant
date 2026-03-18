package service

import (
	"net/http"
	"travel-assistant/src/common"
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

type CalcActivityRouteRequest struct {
	StartActivityID uint `json:"startActivityId" binding:"required"`
	EndActivityID   uint `json:"endActivityId" binding:"required"`
}

type UpdateActivityRouteRequest struct {
	ID uint `json:"id" binding:"required"`
	CreateActivityRouteRequest
}

// 查询活动路线
// @Summary 查询活动路线
// @Description 查询活动路线
// @Tags Activity
// @Accept json
// @Produce json
// @Param request body CalcActivityRouteRequest true "查询活动路线请求"
// @Success 200 {object} common.RouteResult "查询活动路线成功"
// @Router /api/v1/activity/route/query [post]
func QueryActivityRoute(c *gin.Context) {
	request := CalcActivityRouteRequest{}
	context := c.Request.Context()
	if !Response.BindJSON(c, &request) {
		Response.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}
	distanceKm, durationMin, err := common.BaiduMap.GetRoutesHandler(context, request.StartActivityID, request.EndActivityID)
	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "获取路线规划失败")
		return
	}
	Response.Success(c, "获取路线规划成功", gin.H{
		"distanceKm":  distanceKm,
		"durationMin": durationMin,
	})

}
