package commonservice

import (
	"net/http"
	"time"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	activityentity "travel-assistant/src/modules/activity/entity"
	tripentity "travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
)

// validateActivityDate 校验活动日期是否在行程范围内
func ValidateActivityInTrip(c *gin.Context, tripId uint, activityDate string) (*tripentity.TripEntity, bool) {
	trip := tripentity.TripEntity{}
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

// ValidateActivityTimeConflict 校验同一行程同一天内是否存在时间冲突
func ValidateActivityTimeConflict(c *gin.Context, tripID uint, activityDate, startTime, endTime string, excludeActivityID uint) bool {
	db := config.DB.Model(&activityentity.ActivityEntity{}).
		Where("trip_id = ? AND activity_date = ?", tripID, activityDate).
		Where("start_time < ? AND end_time > ?", endTime, startTime)

	if excludeActivityID != 0 {
		db = db.Where("id <> ?", excludeActivityID)
	}

	var count int64
	if err := db.Count(&count).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "校验活动时间冲突失败: "+err.Error())
		return false
	}

	if count > 0 {
		Response.Error(c, http.StatusBadRequest, "活动时间与同一行程中的其他活动冲突")
		return false
	}

	return true
}

// checkTripOwnership 校验用户是否有权限操作该行程
func CheckTripOwnership(c *gin.Context, trip *tripentity.TripEntity) bool {
	userID := c.GetUint("userId")
	if trip.Creator != userID {
		Response.Error(c, http.StatusForbidden, "无权操作该行程的活动")
		return false
	}
	return true
}
