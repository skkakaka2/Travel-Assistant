package service

import (
	"net/http"
	"time"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	"travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
)

type CreateTripRequest struct {
	Title       string  `json:"title" binding:"required,min=3,max=20"`
	UserCount   int     `json:"userCount" binding:"required,min=1"`
	Description string  `json:"description" binding:"min=0,max=200"`
	StartDate   string  `json:"startDate" binding:"required"`
	EndDate     string  `json:"endDate" binding:"required"`
	Budget      float64 `json:"budget" binding:"required,min=0"`
}

type UpdateTripRequest struct {
	ID uint `json:"id" binding:"required"`
	CreateTripRequest
}

type GetTripByPaginationQuery struct {
	Page     int `form:"page" binding:"required,min=1"`
	PageSize int `form:"pageSize" binding:"required,min=10"`
}

type GetTripByPaginationResponse struct {
	Trips []entity.TripEntity `json:"trips"`
}

// validateTripDates 校验行程日期，返回解析后的开始日期和结束日期，校验失败时返回错误并写入响应
func validateTripDates(c *gin.Context, startDateStr, endDateStr string) (time.Time, time.Time, bool) {
	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		Response.Error(c, http.StatusBadRequest, "开始日期格式错误")
		return time.Time{}, time.Time{}, false
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		Response.Error(c, http.StatusBadRequest, "结束日期格式错误")
		return time.Time{}, time.Time{}, false
	}
	if startDate.After(endDate) {
		Response.Error(c, http.StatusBadRequest, "开始日期不能晚于结束日期")
		return time.Time{}, time.Time{}, false
	}
	return startDate, endDate, true
}

// @Summary 创建行程
// @Description 创建行程
// @Tags Trip
// @Accept json
// @Produce json
// @Param request body CreateTripRequest true "创建行程请求"
// @Success 200 {object} entity.TripEntity "创建行程成功"
// @Router /api/v1/trip/create [post]
func CreateTrip(c *gin.Context) {
	request := CreateTripRequest{}
	if !Response.BindJSON(c, &request) {
		return
	}

	// 校验时间
	_, _, ok := validateTripDates(c, request.StartDate, request.EndDate)
	if !ok {
		return
	}

	userID := c.GetUint("userId")

	trip := entity.TripEntity{}
	copier.Copy(&trip, &request)
	trip.Creator = userID

	result := config.DB.Create(&trip)
	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}

	Response.Success(c, "创建行程成功", trip)
}

// @Summary 获取行程分页
// @Description 获取行程分页
// @Tags Trip
// @Accept json
// @Produce json
// @Param page query int true "页码"
// @Param pageSize query int true "每页条数"
// @Success 200 {object} GetTripByPaginationResponse "获取行程分页成功"
// @Router /api/v1/trip/get [get]
func GetTripByPagination(c *gin.Context) {
	request := GetTripByPaginationQuery{}
	if !Response.BindQuery(c, &request) {
		return
	}
	total := int64(0)
	trips := []entity.TripEntity{}
	result := config.DB.Offset(int((request.Page - 1) * request.PageSize)).Limit(int(request.PageSize)).Find(&trips).Count(&total)
	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, "获取行程分页失败: "+result.Error.Error())
		return
	}

	Response.SuccessWithPage(c, "获取行程分页成功", Response.SuccessWithPageResponse[[]entity.TripEntity]{
		List:     trips,
		Total:    int(total),
		Page:     request.Page,
		PageSize: request.PageSize,
	})
}

// @Summary 更新行程
// @Description 更新行程
// @Tags Trip
// @Accept json
// @Produce json
// @Param request body UpdateTripRequest true "更新行程请求"
// @Success 200 {object} entity.TripEntity "更新行程成功"
// @Router /api/v1/trip/update [put]
func UpdateTrip(c *gin.Context) {
	request := UpdateTripRequest{}
	if !Response.BindJSON(c, &request) {
		return
	}

	trip := entity.TripEntity{}
	if err := config.DB.Model(&trip).Where("id = ?", request.ID).First(&trip).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "行程不存在: "+err.Error())
		return
	}

	// 校验时间
	_, _, ok := validateTripDates(c, request.StartDate, request.EndDate)
	if !ok {
		return
	}
	result := config.DB.Model(&trip).Where("id = ?", request.ID).Updates(request)
	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, "更新行程失败: "+result.Error.Error())
		return
	}

	Response.Success(c, "更新行程成功", trip)
}

// @Summary 删除行程
// @Description 删除行程
// @Tags Trip
// @Accept json
// @Produce json
// @Param id query int true "行程ID"
// @Success 200 {object} entity.TripEntity "删除行程成功"
// @Router /api/v1/trip/delete [delete]
func DeleteTrip(c *gin.Context) {
	id := uint(0)
	if !Response.BindQuery(c, &id) {
		return
	}

	trip := entity.TripEntity{}

	if err := config.DB.Model(&trip).Where("id = ?", id).First(&trip).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "行程不存在: "+err.Error())
		return
	}

	if err := config.DB.Where("id = ?", id).Delete(&trip).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "删除行程失败: "+err.Error())
		return
	}

	Response.Success[any](c, "删除行程成功", nil)
}
