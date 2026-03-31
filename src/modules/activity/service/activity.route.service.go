package activityservice

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
	"travel-assistant/src/common"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	activityentity "travel-assistant/src/modules/activity/entity"

	"github.com/gin-gonic/gin"
	"golang.org/x/sync/singleflight"
	"gorm.io/gorm/clause"
)

const (
	RouteCacheKeyPrefix = "route:"
	RouteCacheTTL       = 24 * time.Hour
	RouteCacheTTLJitter = 2 * time.Hour
	RouteLockKeyPrefix  = "lock:route:"
	RouteLockTTL        = 10 * time.Second
)

// routeGroup 单飞组，用于合并相同的路线计算请求
var routeGroup singleflight.Group

func buildRouteCacheKey(startID, endID uint) string {
	if startID > endID {
		startID, endID = endID, startID
	}
	return fmt.Sprintf("%s%d:%d", RouteCacheKeyPrefix, startID, endID)
}

func buildRouteLockKey(startID, endID uint) string {
	if startID > endID {
		startID, endID = endID, startID
	}
	return fmt.Sprintf("%s%d:%d", RouteLockKeyPrefix, startID, endID)
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
// @Success 200 {object} activityentity.ActivityRouteEntity "计算路线成功"
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

	startActivity := activityentity.ActivityEntity{}
	if err := config.DB.Where("id = ?", request.StartActivityID).First(&startActivity).Error; err != nil {
		Response.Error(c, http.StatusNotFound, "起点活动不存在")
		return
	}

	endActivity := activityentity.ActivityEntity{}
	if err := config.DB.Where("id = ?", request.EndActivityID).First(&endActivity).Error; err != nil {
		Response.Error(c, http.StatusNotFound, "终点活动不存在")
		return
	}

	if startActivity.TripID != endActivity.TripID {
		Response.Error(c, http.StatusBadRequest, "起点和终点不属于同一行程")
		return
	}

	cacheKey := buildRouteCacheKey(request.StartActivityID, request.EndActivityID)

	// 1. 快速路径：查 Redis 缓存
	if !request.ForceRefresh && config.Rdb != nil {
		var cachedRoute activityentity.ActivityRouteEntity
		if err := config.Rdb.Get(ctx, cacheKey, &cachedRoute); err == nil {
			Response.Success(c, "获取路线规划成功（Redis缓存）", cachedRoute)
			return
		}
	}

	// 2. 使用 singleflight 合并相同请求，防止缓存击穿
	result, err, _ := routeGroup.Do(cacheKey, func() (any, error) {
		return fetchOrCreateRoute(ctx, request, startActivity.TripID, cacheKey)
	})

	if err != nil {
		Response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	route, ok := result.(activityentity.ActivityRouteEntity)
	if !ok {
		Response.Error(c, http.StatusInternalServerError, "路线数据类型错误")
		return
	}

	Response.Success(c, "获取路线规划成功", route)
}

// fetchOrCreateRoute 获取或创建路线（带分布式锁保护）
func fetchOrCreateRoute(ctx context.Context, request CalcActivityRouteRequest, tripID uint, cacheKey string) (activityentity.ActivityRouteEntity, error) {
	var route activityentity.ActivityRouteEntity

	// 1. 尝试获取分布式锁
	lockKey := buildRouteLockKey(request.StartActivityID, request.EndActivityID)
	locked := false

	if config.Rdb != nil {
		acquired, err := config.Rdb.Lock(ctx, lockKey, RouteLockTTL)
		if err == nil && acquired {
			locked = true
		}
	}

	// 2. 如果没获取到锁，等待后重试查询
	if !locked {
		time.Sleep(100 * time.Millisecond)

		// 先查缓存
		if config.Rdb != nil {
			if err := config.Rdb.Get(ctx, cacheKey, &route); err == nil {
				return route, nil
			}
		}

		// 查数据库
		err := config.DB.Where("start_activity_id = ? AND end_activity_id = ?",
			request.StartActivityID, request.EndActivityID).First(&route).Error
		if err == nil {
			return route, nil
		}

		// 数据库也没有，继续执行（降级处理）
	}

	// 3. 获取到锁后，Double Check 缓存和数据库
	if !request.ForceRefresh {
		if config.Rdb != nil {
			if err := config.Rdb.Get(ctx, cacheKey, &route); err == nil {
				return route, nil
			}
		}

		err := config.DB.Where("start_activity_id = ? AND end_activity_id = ?",
			request.StartActivityID, request.EndActivityID).First(&route).Error
		if err == nil {
			// 回填缓存
			if config.Rdb != nil {
				config.Rdb.Set(ctx, cacheKey, route, config.GetTTLWithJitter(RouteCacheTTL, RouteCacheTTLJitter))
			}
			return route, nil
		}
	}

	// 4. 调用百度地图 API
	distanceKm, durationMin, err := common.BaiduMap.GetRoutesHandler(ctx, request.StartActivityID, request.EndActivityID)
	if err != nil {
		return route, errors.New("获取路线规划失败")
	}

	// 5. 使用 Upsert 写入数据库（原子操作，防止竞态）
	route = activityentity.ActivityRouteEntity{
		StartActivityID: request.StartActivityID,
		EndActivityID:   request.EndActivityID,
		TripID:          tripID,
		Distance:        distanceKm,
		Duration:        durationMin,
	}

	err = config.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "start_activity_id"}, {Name: "end_activity_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"distance", "duration", "trip_id"}),
	}).Create(&route).Error

	if err != nil {
		return route, errors.New("保存路线规划失败")
	}

	// 6. 同步写缓存
	if config.Rdb != nil {
		config.Rdb.Set(ctx, cacheKey, route, config.GetTTLWithJitter(RouteCacheTTL, RouteCacheTTLJitter))
	}

	// 7. 释放锁
	if locked && config.Rdb != nil {
		config.Rdb.Unlock(ctx, lockKey)
	}

	return route, nil
}

// InvalidateActivityRouteCache 清除与指定活动相关的所有路线缓存
func InvalidateActivityRouteCache(ctx context.Context, activityID uint) {
	if config.Rdb == nil {
		return
	}

	var routes []activityentity.ActivityRouteEntity
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
