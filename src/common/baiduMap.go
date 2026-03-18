package common

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"travel-assistant/src/common/config"
	"travel-assistant/src/common/logger"
	"travel-assistant/src/modules/activity/entity"

	"github.com/go-resty/resty/v2"
)

type BaiduMapType struct {
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

var BaiduMap = BaiduMapType{
	Key:      config.AppConfig.BaiduMap.Key,
	BasePath: config.AppConfig.BaiduMap.BasePath,
}

func (b *BaiduMapType) GetRoutesHandler(StartActivityID, EndActivityID uint) (float64, int, error) {
	distanceKm, durationMin, err := BaiduMap.GetRoutes(StartActivityID, EndActivityID)
	if err != nil {
		logger.Sugar.Error("获取路线规划失败: %w", err)
		return 0, 0, err
	}
	return distanceKm, durationMin, nil
}

// GetRoutes 获取两个活动之间的路线规划（距离：公里，时间：分钟）
func (b *BaiduMapType) GetRoutes(startActivityID, endActivityID uint) (distanceKm float64, durationMin int, err error) {
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

	// 构建请求参数（百度地图使用 纬度,经度 格式）
	origin := fmt.Sprintf("%.6f,%.6f", startActivity.Latitude, startActivity.Longitude)
	destination := fmt.Sprintf("%.6f,%.6f", endActivity.Latitude, endActivity.Longitude)

	// 创建 resty 客户端
	client := resty.New().
		SetTimeout(10 * time.Second).
		SetRetryCount(3).
		AddRetryCondition(func(r *resty.Response, err error) bool {
			return r.StatusCode() >= 500 || err != nil
		})

	// 发送请求
	resp, err := client.R().
		Get(b.BasePath + "/directionlite/v1/driving" + "?origin=" + origin + "&destination=" + destination + "&ak=" + b.Key)

	if err != nil {
		return 0, 0, fmt.Errorf("请求百度地图 API 失败: %w", err)
	}

	// 解析 JSON 响应
	var result RouteResult
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		return 0, 0, fmt.Errorf("解析百度地图响应失败: %w", err)
	}
	logger.Sugar.Info("请求百度地图 API 成功: %+v", result)

	if resp.IsError() {
		return 0, 0, fmt.Errorf("百度地图 API 返回错误: status=%d", resp.StatusCode())
	}

	// 检查业务状态码
	if result.Status != 0 {
		return 0, 0, fmt.Errorf("百度地图 API 错误: status=%d, message=%s", result.Status, result.Message)
	}

	// 检查是否有路线结果
	if len(result.Result.Routes) == 0 {
		return 0, 0, fmt.Errorf("未找到可行路线")
	}

	// 取第一条路线（推荐路线）
	route := result.Result.Routes[0]
	distanceKm = math.Round(float64(route.Distance) / 1000.0) // 米转公里
	durationMin = route.Duration / 60

	return distanceKm, durationMin, nil
}
