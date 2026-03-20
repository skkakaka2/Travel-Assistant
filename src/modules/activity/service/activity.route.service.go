package service

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"travel-assistant/src/common"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	"travel-assistant/src/modules/activity/entity"

	"github.com/gin-gonic/gin"
)

const (
	RouteCacheKeyPrefix = "route:"
	RouteCacheTTL       = 24 * time.Hour
)

func buildRouteCacheKey(startID, endID uint) string {
	if startID > endID {
		startID, endID = endID, startID
	}
	return fmt.Sprintf("%s%d:%d", RouteCacheKeyPrefix, startID, endID)
}

type CreateActivityRouteRequest struct {
	StartActivityID uint `json:"startActivityId" binding:"required"`
	EndActivityID   uint `json:"endActivityId" binding:"required"`
}

type CalcActivityRouteRequest struct {
	StartActivityID uint `json:"startActivityId" binding:"required"`
	EndActivityID   uint `json:"endActivityId" binding:"required"`
	ForceRefresh    bool `json:"forceRefresh"`
}

type UpdateActivityRouteRequest struct {
	ID uint `json:"id" binding:"required"`
	CreateActivityRouteRequest
}

type QueryTripRouteRequest struct {
	TripID uint `json:"tripId" binding:"required"`
}

// 计算并保存活动路线
// @Summary 计算并保存活动路线
// @Description 计算两个活动之间的路线并保存，已存在的路线会从缓存直接返回
// @Tags Activity
// @Accept json
// @Produce json
// @Param request body CalcActivityRouteRequest true "计算活动路线请求"
// @Success 200 {object} entity.ActivityRouteEntity "计算路线成功"
// @Router /api/v1/activity/route/calc [post]
func CalcActivityRoute(c *gin.Context) {
	request := CalcActivityRouteRequest{}
	ctx := c.Request.Context()
	if !Response.BindJSON(c, &request) {
		Response.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if request.StartActivityID == request.EndActivityID {
		Response.Error(c, http.StatusBadRequest, "起点和终点不能相同")
		return
	}

	startActivity := entity.ActivityEntity{}
	if err := config.DB.Where("id = ?", request.StartActivityID).First(&startActivity).Error; err != nil {
		Response.Error(c, http.StatusNotFound, "起点活动不存在")
		return
	}

	endActivity := entity.ActivityEntity{}
	if err := config.DB.Where("id = ?", request.EndActivityID).First(&endActivity).Error; err != nil {
		Response.Error(c, http.StatusNotFound, "终点活动不存在")
		return
	}

	if startActivity.TripID != endActivity.TripID {
		Response.Error(c, http.StatusBadRequest, "起点和终点不属于同一行程")
		return
	}

	cacheKey := buildRouteCacheKey(request.StartActivityID, request.EndActivityID)

	if !request.ForceRefresh {
		if config.Rdb != nil {
			var cachedRoute entity.ActivityRouteEntity
			if err := config.Rdb.Get(ctx, cacheKey, &cachedRoute); err == nil {
				Response.Success(c, "获取路线规划成功（Redis缓存）", cachedRoute)
				return
			}
		}

		existingRoute := entity.ActivityRouteEntity{}
		err := config.DB.Where("start_activity_id = ? AND end_activity_id = ?", request.StartActivityID, request.EndActivityID).First(&existingRoute).Error
		if err == nil {
			if config.Rdb != nil {
				go config.Rdb.Set(context.Background(), cacheKey, existingRoute, RouteCacheTTL)
			}
			Response.Success(c, "获取路线规划成功（数据库缓存）", existingRoute)
			return
		}
	}

	distanceKm, durationMin, err := common.BaiduMap.GetRoutesHandler(ctx, request.StartActivityID, request.EndActivityID)
	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "获取路线规划失败")
		return
	}

	route := entity.ActivityRouteEntity{
		StartActivityID: request.StartActivityID,
		EndActivityID:   request.EndActivityID,
		TripID:          startActivity.TripID,
		Distance:        distanceKm,
		Duration:        durationMin,
	}

	existingRoute := entity.ActivityRouteEntity{}
	err = config.DB.Where("start_activity_id = ? AND end_activity_id = ?", request.StartActivityID, request.EndActivityID).First(&existingRoute).Error

	if err == nil {
		route.ID = existingRoute.ID
		if err := config.DB.Model(&route).Updates(&route).Error; err != nil {
			Response.Error(c, http.StatusInternalServerError, "更新路线规划失败")
			return
		}
	} else {
		if err := config.DB.Create(&route).Error; err != nil {
			Response.Error(c, http.StatusInternalServerError, "创建路线规划失败")
			return
		}
	}

	if config.Rdb != nil {
		config.Rdb.Set(ctx, cacheKey, route, RouteCacheTTL)
	}

	Response.Success(c, "获取路线规划成功", route)
}

// InvalidateActivityRouteCache 清除与指定活动相关的所有路线缓存
func InvalidateActivityRouteCache(ctx context.Context, activityID uint) {
	if config.Rdb == nil {
		return
	}

	var routes []entity.ActivityRouteEntity
	if err := config.DB.Where("start_activity_id = ? OR end_activity_id = ?", activityID, activityID).Find(&routes).Error; err != nil {
		return
	}

	var keys []string
	for _, route := range routes {
		keys = append(keys, buildRouteCacheKey(route.StartActivityID, route.EndActivityID))
	}

	if len(keys) > 0 {
		config.Rdb.Delete(ctx, keys...)
	}
}
