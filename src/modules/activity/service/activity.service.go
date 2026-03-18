package service

import (
	"net/http"
	"time"
	"travel-assistant/src/common"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	"travel-assistant/src/modules/activity/entity"
	commonService "travel-assistant/src/modules/common/service"
	tripEntity "travel-assistant/src/modules/trip/entity"
	tripService "travel-assistant/src/modules/trip/service"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"gorm.io/gorm"
)

type CreateActivityRequest struct {
	TripID       uint   `json:"tripId" binding:"required"`
	Title        string `json:"title" binding:"required,max=255"`
	Description  string `json:"description"`
	ActivityDate string `json:"activityDate" binding:"required"`
	StartTime    string `json:"startTime" binding:"required,datetime=15:04"`
	EndTime      string `json:"endTime" binding:"required,datetime=15:04"`
	Location     string `json:"location"`
	Cost         uint   `json:"cost" binding:"required,min=0"`

	Longitude float64 `json:"longitude" binding:"required"`
	Latitude  float64 `json:"latitude" binding:"required"`

	Hotel         string `json:"hotel" binding:"omitempty,max=255"`
	HotelAddress  string `json:"hotelAddress" binding:"omitempty,max=255"`
	HotelCost     uint   `json:"hotelCost" binding:"omitempty,min=0"`
	TransportType string `json:"transportType" binding:"omitempty,max=255"`
	TransportCost uint   `json:"transportCost" binding:"omitempty,min=0"`
}

type UpdateActivityRequest struct {
	ID uint `json:"id" binding:"required"`
	CreateActivityRequest
}

type GetActivitiesQuery struct {
	TripID uint   `form:"tripId" binding:"required"`
	Date   string `form:"date"`
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
	if !Response.BindJSON(c, &request) {
		return
	}

	// 校验活动日期是否在行程范围内，并获取行程信息
	trip, ok := commonService.ValidateActivityInTrip(c, request.TripID, request.ActivityDate)
	if !ok {
		return
	}

	// 校验权限
	if !commonService.CheckTripOwnership(c, trip) {
		return
	}

	// 校验时间格式
	if !commonService.ValidateActivityTime(c, request.StartTime, request.EndTime) {
		return
	}

	activity := entity.ActivityEntity{}
	request.Cost = request.HotelCost + request.TransportCost
	copier.Copy(&activity, &request)

	if err := common.WithTransection(c, func(tx *gorm.DB) error {
		costs := []int{}
		costSum := 0
		if err := tx.Model(&entity.ActivityEntity{}).Create(&activity).Error; err != nil {
			return err
		}
		if err := tx.Model(&entity.ActivityEntity{}).Where("trip_id=?", request.TripID).Pluck("cost", &costs).Error; err != nil {
			return err
		}
		for i := range costs {
			costSum += costs[i]
		}
		if err := tx.Model(&tripEntity.TripEntity{}).Where("id=?", request.TripID).Update("cost", costSum).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		Response.Error(c, http.StatusInternalServerError, "创建活动失败: "+err.Error())
		return
	}

	if _, err := tripService.CheckTripCostIsOverBudget(request.TripID); err != nil {
		Response.Error(c, http.StatusInternalServerError, "创建活动失败: "+err.Error())
		return
	}

	Response.Success(c, "创建活动成功", activity)
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
	if !Response.BindQuery(c, &query) {
		return
	}

	// 校验行程是否存在
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, query.TripID).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}

	// 校验权限
	if !commonService.CheckTripOwnership(c, &trip) {
		return
	}

	// 构建查询
	db := config.DB.Where("trip_id = ?", query.TripID)
	if query.Date != "" {
		// 校验日期格式
		if _, err := time.Parse("2006-01-02", query.Date); err != nil {
			Response.Error(c, http.StatusBadRequest, "日期格式错误")
			return
		}
		db = db.Where("activity_date = ?", query.Date)
	}

	// 按日期和时间排序
	var activities []entity.ActivityEntity
	if err := db.Order("activity_date ASC, start_time ASC").Find(&activities).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "获取活动列表失败: "+err.Error())
		return
	}

	Response.Success(c, "获取活动列表成功", activities)
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
	if !Response.BindJSON(c, &request) {
		return
	}

	// 查询原活动
	activity := entity.ActivityEntity{}
	if err := config.DB.First(&activity, request.ID).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "活动不存在")
		return
	}

	// 校验行程是否存在
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, request.TripID).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}

	// 校验权限
	if !commonService.CheckTripOwnership(c, &trip) {
		return
	}

	// 如果更改了日期，校验新日期是否在行程范围内
	if request.ActivityDate != activity.ActivityDate {
		_, ok := commonService.ValidateActivityInTrip(c, request.TripID, request.ActivityDate)
		if !ok {
			return
		}
	}

	// 校验时间格式
	if !commonService.ValidateActivityTime(c, request.StartTime, request.EndTime) {
		return
	}

	// 更新活动
	updates := entity.ActivityEntity{}
	copier.Copy(&updates, &request)

	if err := config.DB.Model(&activity).Where("id = ?", request.ID).Updates(&updates).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "更新活动失败: "+err.Error())
		return
	}

	if _, err := tripService.CheckTripCostIsOverBudget(request.TripID); err != nil {
		Response.Error(c, http.StatusInternalServerError, "更新活动失败: "+err.Error())
		return
	}

	// 重新查询获取更新后的数据
	config.DB.First(&activity, request.ID)
	Response.Success(c, "更新活动成功", activity)
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
	if !Response.BindQuery(c, &id) {
		return
	}

	// 查询活动
	activity := entity.ActivityEntity{}
	if err := config.DB.First(&activity, id).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "活动不存在")
		return
	}

	// 查询行程并校验权限
	trip := tripEntity.TripEntity{}
	if err := config.DB.First(&trip, activity.TripID).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "行程数据异常")
		return
	}

	if !commonService.CheckTripOwnership(c, &trip) {
		return
	}

	// 删除活动
	if err := config.DB.Delete(&activity).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "删除活动失败: "+err.Error())
		return
	}

	Response.Success[any](c, "删除活动成功", nil)
}
