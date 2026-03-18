package service

import (
	"net/http"
	"time"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	tripEntity "travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
)

// validateActivityDate 校验活动日期是否在行程范围内
func ValidateActivityInTrip(c *gin.Context, tripId uint, activityDate string) (*tripEntity.TripEntity, bool) {
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, tripId).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "行程不存在")
		return nil, false
	}

	// 校验日期格式
	date, err := time.Parse("2006-01-02", activityDate)
	if err != nil {
		Response.Error(c, http.StatusBadRequest, "活动日期格式错误")
		return nil, false
	}

	// 校验是否在行程范围内
	startDate, _ := time.Parse("2006-01-02", trip.StartDate)
	endDate, _ := time.Parse("2006-01-02", trip.EndDate)

	if date.Before(startDate) || date.After(endDate) {
		Response.Error(c, http.StatusBadRequest, "活动日期必须在行程日期范围内")
		return nil, false
	}

	return &trip, true
}

// validateActivityTime 校验时间格式和顺序
func ValidateActivityTime(c *gin.Context, startTime, endTime string) bool {
	// 如果都为空，不校验
	if startTime == "" && endTime == "" {
		return true
	}

	// 校验开始时间格式
	if startTime != "" {
		if _, err := time.Parse("15:04", startTime); err != nil {
			Response.Error(c, http.StatusBadRequest, "开始时间格式错误，应为HH:mm")
			return false
		}
	}

	// 校验结束时间格式
	if endTime != "" {
		if _, err := time.Parse("15:04", endTime); err != nil {
			Response.Error(c, http.StatusBadRequest, "结束时间格式错误，应为HH:mm")
			return false
		}
	}

	// 如果都有值，校验顺序
	if startTime != "" && endTime != "" {
		if startTime >= endTime {
			Response.Error(c, http.StatusBadRequest, "开始时间不能晚于或等于结束时间")
			return false
		}
	}

	return true
}

// checkTripOwnership 校验用户是否有权限操作该行程
func CheckTripOwnership(c *gin.Context, trip *tripEntity.TripEntity) bool {
	userID := c.GetUint("userId")
	if trip.Creator != userID {
		Response.Error(c, http.StatusForbidden, "无权操作该行程的活动")
		return false
	}
	return true
}
