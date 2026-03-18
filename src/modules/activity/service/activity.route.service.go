package service

import (
	"net/http"
	"travel-assistant/src/common"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	"travel-assistant/src/modules/activity/entity"

	"github.com/gin-gonic/gin"
)

type CreateActivityRouteRequest struct {
	StartActivityID uint `json:"startActivityId" binding:"required"`
	EndActivityID   uint `json:"endActivityId" binding:"required"`
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
	startActivity := entity.ActivityEntity{}
	if err := config.DB.Where("id=?", request.StartActivityID).First(&startActivity).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "获取起点活动失败")
		return
	}

	var route = entity.ActivityRouteEntity{}
	route.Distance = distanceKm
	route.Duration = durationMin
	route.StartActivityID = request.StartActivityID
	route.EndActivityID = request.EndActivityID
	route.TripID = startActivity.TripID
	if err := config.DB.Model(&route).Create(&route).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "创建路线规划失败")
		return
	}
	Response.Success(c, "获取路线规划成功", route)
}
