package service

import (
	"net/http"
	"time"
	"travel-assistant/src/common/config"
	"travel-assistant/src/common/response"
	"travel-assistant/src/modules/activity/entity"
	tripEntity "travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
)

type CreateActivityRequest struct {
	TripID       uint    `json:"tripId" binding:"required"`
	Title        string  `json:"title" binding:"required,max=255"`
	Description  string  `json:"description"`
	ActivityDate string  `json:"activityDate" binding:"required"`
	StartTime    string  `json:"startTime"`
	EndTime      string  `json:"endTime"`
	Location     string  `json:"location"`
	Cost         float64 `json:"cost" binding:"required,min=0"`
}

type UpdateActivityRequest struct {
	ID           uint    `json:"id" binding:"required"`
	TripID       uint    `json:"tripId" binding:"required"`
	Title        string  `json:"title" binding:"required,max=255"`
	Description  string  `json:"description"`
	ActivityDate string  `json:"activityDate" binding:"required"`
	StartTime    string  `json:"startTime"`
	EndTime      string  `json:"endTime"`
	Location     string  `json:"location"`
	Cost         float64 `json:"cost" binding:"required,min=0"`
}

type GetActivitiesQuery struct {
	TripID uint   `form:"tripId" binding:"required"`
	Date   string `form:"date"`
}

// validateActivityDate 校验活动日期是否在行程范围内
func validateActivityInTrip(c *gin.Context, tripId uint, activityDate string) (*tripEntity.TripEntity, bool) {
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, tripId).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "行程不存在")
		return nil, false
	}

	// 校验日期格式
	date, err := time.Parse("2006-01-02", activityDate)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "活动日期格式错误")
		return nil, false
	}

	// 校验是否在行程范围内
	startDate, _ := time.Parse("2006-01-02", trip.StartDate)
	endDate, _ := time.Parse("2006-01-02", trip.EndDate)

	if date.Before(startDate) || date.After(endDate) {
		response.Error(c, http.StatusBadRequest, "活动日期必须在行程日期范围内")
		return nil, false
	}

	return &trip, true
}

// validateActivityTime 校验时间格式和顺序
func validateActivityTime(c *gin.Context, startTime, endTime string) bool {
	// 如果都为空，不校验
	if startTime == "" && endTime == "" {
		return true
	}

	// 校验开始时间格式
	if startTime != "" {
		if _, err := time.Parse("15:04", startTime); err != nil {
			response.Error(c, http.StatusBadRequest, "开始时间格式错误，应为HH:mm")
			return false
		}
	}

	// 校验结束时间格式
	if endTime != "" {
		if _, err := time.Parse("15:04", endTime); err != nil {
			response.Error(c, http.StatusBadRequest, "结束时间格式错误，应为HH:mm")
			return false
		}
	}

	// 如果都有值，校验顺序
	if startTime != "" && endTime != "" {
		if startTime >= endTime {
			response.Error(c, http.StatusBadRequest, "开始时间不能晚于或等于结束时间")
			return false
		}
	}

	return true
}

// checkTripOwnership 校验用户是否有权限操作该行程
func checkTripOwnership(c *gin.Context, trip *tripEntity.TripEntity) bool {
	userID := c.GetUint("userId")
	if trip.Creator != userID {
		response.Error(c, http.StatusForbidden, "无权操作该行程的活动")
		return false
	}
	return true
}

// @Summary 创建活动
// @Description 为指定行程创建活动
// @Tags Activity
// @Accept json
// @Produce json
// @Param request body CreateActivityRequest true "创建活动请求"
// @Success 200 {object} entity.ActivityEntity "创建活动成功"
// @Router /api/v1/activity/create [post]
func CreateActivity(c *gin.Context) {
	request := CreateActivityRequest{}
	if !response.BindJSON(c, &request) {
		return
	}

	// 校验活动日期是否在行程范围内，并获取行程信息
	trip, ok := validateActivityInTrip(c, request.TripID, request.ActivityDate)
	if !ok {
		return
	}

	// 校验权限
	if !checkTripOwnership(c, trip) {
		return
	}

	// 校验时间格式
	if !validateActivityTime(c, request.StartTime, request.EndTime) {
		return
	}

	activity := entity.ActivityEntity{
		TripID:       request.TripID,
		Title:        request.Title,
		Description:  request.Description,
		ActivityDate: request.ActivityDate,
		StartTime:    request.StartTime,
		EndTime:      request.EndTime,
		Location:     request.Location,
		Cost:         request.Cost,
	}

	if err := config.DB.Create(&activity).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "创建活动失败: "+err.Error())
		return
	}

	response.Success(c, "创建活动成功", activity)
}

// @Summary 获取活动列表
// @Description 获取指定行程的活动列表，可按日期筛选
// @Tags Activity
// @Accept json
// @Produce json
// @Param tripId query int true "行程ID"
// @Param date query string false "日期筛选(yyyy-MM-dd)"
// @Success 200 {array} entity.ActivityEntity "获取活动列表成功"
// @Router /api/v1/activity/list [get]
func GetActivities(c *gin.Context) {
	query := GetActivitiesQuery{}
	if !response.BindQuery(c, &query) {
		return
	}

	// 校验行程是否存在
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, query.TripID).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}

	// 校验权限
	if !checkTripOwnership(c, &trip) {
		return
	}

	// 构建查询
	db := config.DB.Where("trip_id = ?", query.TripID)
	if query.Date != "" {
		// 校验日期格式
		if _, err := time.Parse("2006-01-02", query.Date); err != nil {
			response.Error(c, http.StatusBadRequest, "日期格式错误")
			return
		}
		db = db.Where("activity_date = ?", query.Date)
	}

	// 按日期和时间排序
	var activities []entity.ActivityEntity
	if err := db.Order("activity_date ASC, start_time ASC").Find(&activities).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "获取活动列表失败: "+err.Error())
		return
	}

	response.Success(c, "获取活动列表成功", activities)
}

// @Summary 更新活动
// @Description 更新活动信息
// @Tags Activity
// @Accept json
// @Produce json
// @Param request body UpdateActivityRequest true "更新活动请求"
// @Success 200 {object} entity.ActivityEntity "更新活动成功"
// @Router /api/v1/activity/update [put]
func UpdateActivity(c *gin.Context) {
	request := UpdateActivityRequest{}
	if !response.BindJSON(c, &request) {
		return
	}

	// 查询原活动
	activity := entity.ActivityEntity{}
	if err := config.DB.First(&activity, request.ID).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "活动不存在")
		return
	}

	// 校验行程是否存在
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, request.TripID).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}

	// 校验权限
	if !checkTripOwnership(c, &trip) {
		return
	}

	// 如果更改了日期，校验新日期是否在行程范围内
	if request.ActivityDate != activity.ActivityDate {
		_, ok := validateActivityInTrip(c, request.TripID, request.ActivityDate)
		if !ok {
			return
		}
	}

	// 校验时间格式
	if !validateActivityTime(c, request.StartTime, request.EndTime) {
		return
	}

	// 更新活动
	updates := entity.ActivityEntity{
		TripID:       request.TripID,
		Title:        request.Title,
		Description:  request.Description,
		ActivityDate: request.ActivityDate,
		StartTime:    request.StartTime,
		EndTime:      request.EndTime,
		Location:     request.Location,
		Cost:         request.Cost,
	}

	if err := config.DB.Model(&activity).Updates(updates).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "更新活动失败: "+err.Error())
		return
	}

	// 重新查询获取更新后的数据
	config.DB.First(&activity, request.ID)
	response.Success(c, "更新活动成功", activity)
}

// @Summary 删除活动
// @Description 删除指定活动
// @Tags Activity
// @Accept json
// @Produce json
// @Param id query int true "活动ID"
// @Success 200 {object} nil "删除活动成功"
// @Router /api/v1/activity/delete [delete]
func DeleteActivity(c *gin.Context) {
	id := uint(0)
	if !response.BindQuery(c, &id) {
		return
	}

	// 查询活动
	activity := entity.ActivityEntity{}
	if err := config.DB.First(&activity, id).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "活动不存在")
		return
	}

	// 查询行程并校验权限
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, activity.TripID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "行程数据异常")
		return
	}

	if !checkTripOwnership(c, &trip) {
		return
	}

	// 删除活动
	if err := config.DB.Delete(&activity).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "删除活动失败: "+err.Error())
		return
	}

	response.Success[any](c, "删除活动成功", nil)
}
