package common

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	"travel-assistant/src/modules/activity/entity"

	"github.com/gin-gonic/gin"
)

var instance *BaiduMap

type BaiduMap struct {
	Key      string `json:"key"`
	BasePath string `json:"basePath"`
}

// RouteResult 百度地图路线规划返回结果
type RouteResult struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Result  Result `json:"result"`
}

type Result struct {
	Routes []Route `json:"routes"`
}

type Route struct {
	Distance int `json:"distance"` // 路线距离，单位：米
	Duration int `json:"duration"` // 路线耗时，单位：秒
}

func New() *BaiduMap {
	if instance == nil {
		instance = &BaiduMap{
			Key:      config.AppConfig.BaiduMap.Key,
			BasePath: config.AppConfig.BaiduMap.BasePath,
		}
	}
	return instance
}

// GetRoutesHandler 获取活动间路线规划（HTTP Handler）
// @Summary 获取活动间路线规划
// @Description 调用百度地图API，计算两个活动之间的驾车路线距离和预计时间
// @Tags Map
// @Accept json
// @Produce json
// @Param startActivityID query int true "起点活动ID"
// @Param endActivityID query int true "终点活动ID"
// @Success 200 {object} map[string]interface{} "{\"distanceKm\":125.5,\"durationMin\":98}"
// @Router /api/v1/map/route [get]
func GetRoutesHandler(c *gin.Context) {
	startID, err := strconv.ParseUint(c.Query("startActivityID"), 10, 32)
	if err != nil {
		Response.Error(c, http.StatusBadRequest, "起点活动ID格式错误")
		return
	}
	endID, err := strconv.ParseUint(c.Query("endActivityID"), 10, 32)
	if err != nil {
		Response.Error(c, http.StatusBadRequest, "终点活动ID格式错误")
		return
	}

	baiduMap := New()
	distanceKm, durationMin, err := baiduMap.GetRoutes(uint(startID), uint(endID))
	if err != nil {
		Response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Response.Success(c, "获取路线规划成功", gin.H{
		"distanceKm":  distanceKm,
		"durationMin": durationMin,
	})
}

// GetRoutes 获取两个活动之间的路线规划（距离：公里，时间：分钟）

func (b *BaiduMap) GetRoutes(startActivityID, endActivityID uint) (distanceKm float64, durationMin int, err error) {
	// 查询起点活动
	startActivity := entity.ActivityEntity{}
	if err := config.DB.First(&startActivity, startActivityID).Error; err != nil {
		return 0, 0, fmt.Errorf("查询起点活动失败: %w", err)
	}

	// 查询终点活动
	endActivity := entity.ActivityEntity{}
	if err := config.DB.First(&endActivity, endActivityID).Error; err != nil {
		return 0, 0, fmt.Errorf("查询终点活动失败: %w", err)
	}

	// 构建请求 URL（百度地图使用 纬度,经度 格式）
	origin := fmt.Sprintf("%.6f,%.6f", startActivity.Latitude, startActivity.Longitude)
	destination := fmt.Sprintf("%.6f,%.6f", endActivity.Latitude, endActivity.Longitude)
	url := fmt.Sprintf("%s/directionlite/v1/driving?origin=%s&destination=%s&ak=%s",
		b.BasePath, origin, destination, b.Key)

	// 发送 HTTP 请求
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return 0, 0, fmt.Errorf("请求百度地图 API 失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var result RouteResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, 0, fmt.Errorf("解析百度地图响应失败: %w", err)
	}

	// 检查状态码
	if result.Status != 0 {
		return 0, 0, fmt.Errorf("百度地图 API 错误: status=%d, message=%s", result.Status, result.Message)
	}

	// 检查是否有路线结果
	if len(result.Result.Routes) == 0 {
		return 0, 0, fmt.Errorf("未找到可行路线")
	}

	// 取第一条路线（推荐路线）
	route := result.Result.Routes[0]
	distanceKm = float64(route.Distance) / 1000.0 // 米转公里
	durationMin = route.Duration / 60             // 秒转分钟

	return distanceKm, durationMin, nil
}
