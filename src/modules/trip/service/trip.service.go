package service

import (
	"net/http"
	"travel-assistant/src/common/config"
	"travel-assistant/src/common/response"
	"travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
)

type CreateTripRequest struct {
	Title       string  `json:"title" binding:"required,min=3,max=20"`
	UserCount   int     `json:"userCount" binding:"required,min=1"`
	Description string  `json:"description" binding:"min=0,max=200"`
	StartDate   string  `json:"startDate" binding:"required"`
	EndDate     string  `json:"endDate" binding:"required"`
	Budget      float64 `json:"budget" binding:"required,min=0"`
}

type GetTripByPaginationRequest struct {
	Page     int `json:"page" binding:"required,min=1"`
	PageSize int `json:"pageSize" binding:"required,min=10"`
}

type GetTripByPaginationResponse struct {
	Trips []entity.TripEntity `json:"trips"`
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
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	userID := c.GetUint("userId")

	trip := entity.TripEntity{
		Title:       request.Title,
		UserCount:   request.UserCount,
		Description: request.Description,
		StartDate:   request.StartDate,
		EndDate:     request.EndDate,
		Budget:      request.Budget,
		Creator:     userID,
	}

	result := config.DB.Create(&trip)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}

	response.Success(c, "创建行程成功", trip)
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
	request := GetTripByPaginationRequest{}
	if err := c.ShouldBindQuery(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return
	}

	trips := []entity.TripEntity{}
	result := config.DB.Offset((request.Page - 1) * request.PageSize).Limit(request.PageSize).Find(&trips).Count(&total)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取行程分页失败: "+result.Error.Error())
		return
	}

	response.SuccessWithPage(c, "获取行程分页成功", result.)
}

func UpdateTrip(c *gin.Context) {}

func DeleteTrip(c *gin.Context) {

}
