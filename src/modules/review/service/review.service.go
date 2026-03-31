package reviewservice

import (
	"net/http"
	"time"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	activityentity "travel-assistant/src/modules/activity/entity"
	reviewentity "travel-assistant/src/modules/review/entity"
	tripentity "travel-assistant/src/modules/trip/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ============== 请求/响应结构体 ==============

type HotelReviewInput struct {
	ActivityID    uint   `json:"activityId" binding:"required"`
	OverallRating int8   `json:"overallRating" binding:"required,min=1,max=5"`
	PriceRating   int8   `json:"priceRating" binding:"required,min=1,max=5"`
	Comment       string `json:"comment" binding:"max=300"`
}

type CreateReviewRequest struct {
	TripID         uint              `json:"tripId" binding:"required"`
	OverallRating  int8              `json:"overallRating" binding:"required,min=1,max=5"`
	OverallComment string            `json:"overallComment" binding:"max=500"`
	HotelReviews   []HotelReviewInput `json:"hotelReviews"`
}

type GetReviewDetailQuery struct {
	TripID uint `form:"tripId" binding:"required"`
}

type CostBreakdownDetail struct {
	Total       uint    `json:"total"`
	Hotel       uint    `json:"hotel"`
	Transport   uint    `json:"transport"`
	Activity    uint    `json:"activity"`
	Budget      uint    `json:"budget"`
	Diff        int     `json:"diff"`
	DiffPercent float64 `json:"diffPercent"`
}

type ReviewDetailResponse struct {
	TripReview    reviewentity.TripReviewEntity `json:"tripReview"`
	HotelReviews  []reviewentity.HotelReviewEntity `json:"hotelReviews"`
	CostBreakdown CostBreakdownDetail `json:"costBreakdown"`
}

type UserStatsResponse struct {
	TotalReviews    int     `json:"totalReviews"`
	AvgOverallRating float64 `json:"avgOverallRating"`
	AvgHotelRating   float64 `json:"avgHotelRating"`
	AvgPriceRating   float64 `json:"avgPriceRating"`
	TotalSaved       int     `json:"totalSaved"`     // 总节省金额（预算-实际）
	TotalOverspent   int     `json:"totalOverspent"` // 总超支金额
}

// ============== API 处理器 ==============

// GetAvailableTrips 获取可复盘行程列表（已结束且未复盘）
// @Summary 获取可复盘行程
// @Description 获取已结束且未复盘的行程列表
// @Tags Review
// @Accept json
// @Produce json
// @Success 200 {array} tripentity.TripEntity "获取成功"
// @Router /api/v1/review/trips/available [get]
func GetAvailableTrips(c *gin.Context) {
	userID := c.GetUint("userId")
	today := time.Now().Format("2006-01-02")

	// 查询已结束且未复盘的行程
	var trips []tripentity.TripEntity
	err := config.DB.Where("creator = ? AND end_date < ? AND id NOT IN (?)",
		userID, today,
		config.DB.Model(&reviewentity.TripReviewEntity{}).Select("trip_id").Where("status = 1"),
	).Find(&trips).Error

	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}

	Response.Success(c, "获取可复盘行程成功", trips)
}

// GetCompletedReviews 获取已完成复盘的行程列表
// @Summary 获取已完成复盘
// @Description 获取已完成复盘的行程列表
// @Tags Review
// @Accept json
// @Produce json
// @Success 200 {array} ReviewDetailResponse "获取成功"
// @Router /api/v1/review/trips/completed [get]
func GetCompletedReviews(c *gin.Context) {
	userID := c.GetUint("userId")

	var reviews []reviewentity.TripReviewEntity
	err := config.DB.Where("trip_id IN (?)",
		config.DB.Model(&tripentity.TripEntity{}).Select("id").Where("creator = ?", userID),
	).Where("status = 1").Find(&reviews).Error

	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}

	// 构建响应
	var responses []ReviewDetailResponse
	for _, review := range reviews {
		var hotelReviews []reviewentity.HotelReviewEntity
		config.DB.Where("trip_review_id = ?", review.ID).Find(&hotelReviews)

		// 获取行程预算
		var trip tripentity.TripEntity
		config.DB.First(&trip, review.TripID)

		responses = append(responses, ReviewDetailResponse{
			TripReview:   review,
			HotelReviews: hotelReviews,
			CostBreakdown: CostBreakdownDetail{
				Total:       review.TotalCost,
				Hotel:       review.HotelCost,
				Transport:   review.TransportCost,
				Activity:    review.ActivityCost,
				Budget:      trip.Budget,
				Diff:        review.BudgetDiff,
				DiffPercent: calculateDiffPercent(review.BudgetDiff, trip.Budget),
			},
		})
	}

	Response.Success(c, "获取已完成复盘成功", responses)
}

// CreateReview 创建/更新复盘
// @Summary 创建复盘
// @Description 创建行程复盘，包含酒店评分
// @Tags Review
// @Accept json
// @Produce json
// @Param request body CreateReviewRequest true "创建复盘请求"
// @Success 200 {object} ReviewDetailResponse "创建成功"
// @Router /api/v1/review/create [post]
func CreateReview(c *gin.Context) {
	request := CreateReviewRequest{}
	if !Response.BindJSON(c, &request) {
		return
	}

	userID := c.GetUint("userId")

	// 校验行程存在且属于当前用户
	var trip tripentity.TripEntity
	if err := config.DB.First(&trip, request.TripID).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}
	if trip.Creator != userID {
		Response.Error(c, http.StatusForbidden, "无权操作该行程")
		return
	}

	// 校验行程已结束
	today := time.Now().Format("2006-01-02")
	endDate, _ := time.Parse("2006-01-02", trip.EndDate)
	todayDate, _ := time.Parse("2006-01-02", today)
	if endDate.After(todayDate) || endDate.Equal(todayDate) {
		Response.Error(c, http.StatusBadRequest, "行程尚未结束，无法复盘")
		return
	}

	// 计算花费统计
	costBreakdown := calculateCostBreakdown(request.TripID)

	// 使用事务创建复盘
	var tripReview reviewentity.TripReviewEntity
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 检查是否已存在复盘
		var existingReview reviewentity.TripReviewEntity
		if err := tx.Where("trip_id = ?", request.TripID).First(&existingReview).Error; err == nil {
			// 更新现有复盘
			existingReview.Status = 1
			existingReview.TotalCost = costBreakdown.Total
			existingReview.HotelCost = costBreakdown.Hotel
			existingReview.TransportCost = costBreakdown.Transport
			existingReview.ActivityCost = costBreakdown.Activity
			existingReview.BudgetDiff = costBreakdown.Diff
			existingReview.OverallRating = request.OverallRating
			existingReview.OverallComment = request.OverallComment
			if err := tx.Save(&existingReview).Error; err != nil {
				return err
			}
			tripReview = existingReview

			// 删除旧的酒店评分
			if err := tx.Where("trip_review_id = ?", existingReview.ID).Delete(&reviewentity.HotelReviewEntity{}).Error; err != nil {
				return err
			}
		} else {
			// 创建新复盘
			tripReview = reviewentity.TripReviewEntity{
				TripID:         request.TripID,
				Status:         1,
				TotalCost:      costBreakdown.Total,
				HotelCost:      costBreakdown.Hotel,
				TransportCost:  costBreakdown.Transport,
				ActivityCost:   costBreakdown.Activity,
				BudgetDiff:     costBreakdown.Diff,
				OverallRating:  request.OverallRating,
				OverallComment: request.OverallComment,
			}
			if err := tx.Create(&tripReview).Error; err != nil {
				return err
			}
		}

		// 创建酒店评分
		for _, hr := range request.HotelReviews {
			// 校验活动存在且有酒店信息
			var activity activityentity.ActivityEntity
			if err := tx.First(&activity, hr.ActivityID).Error; err != nil {
				return err
			}
			if activity.TripID != request.TripID {
				return gorm.ErrRecordNotFound
			}
			if activity.Hotel == "" {
				continue // 跳过没有酒店的活动
			}

			hotelReview := reviewentity.HotelReviewEntity{
				TripReviewID:  tripReview.ID,
				ActivityID:    hr.ActivityID,
				HotelName:     activity.Hotel,
				OverallRating: hr.OverallRating,
				PriceRating:   hr.PriceRating,
				Comment:       hr.Comment,
			}
			if err := tx.Create(&hotelReview).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "创建复盘失败: "+err.Error())
		return
	}

	// 返回完整复盘详情
	var hotelReviews []reviewentity.HotelReviewEntity
	config.DB.Where("trip_review_id = ?", tripReview.ID).Find(&hotelReviews)

	costBreakdown.Budget = trip.Budget
	costBreakdown.DiffPercent = calculateDiffPercent(costBreakdown.Diff, trip.Budget)

	Response.Success(c, "创建复盘成功", ReviewDetailResponse{
		TripReview:    tripReview,
		HotelReviews:  hotelReviews,
		CostBreakdown: costBreakdown,
	})
}

// GetReviewDetail 获取复盘详情
// @Summary 获取复盘详情
// @Description 获取指定行程的复盘详情
// @Tags Review
// @Accept json
// @Produce json
// @Param tripId query int true "行程ID"
// @Success 200 {object} ReviewDetailResponse "获取成功"
// @Router /api/v1/review/get [get]
func GetReviewDetail(c *gin.Context) {
	query := GetReviewDetailQuery{}
	if !Response.BindQuery(c, &query) {
		return
	}

	userID := c.GetUint("userId")

	// 校验行程存在且属于当前用户
	var trip tripentity.TripEntity
	if err := config.DB.First(&trip, query.TripID).Error; err != nil {
		Response.Error(c, http.StatusBadRequest, "行程不存在")
		return
	}
	if trip.Creator != userID {
		Response.Error(c, http.StatusForbidden, "无权操作该行程")
		return
	}

	// 查询复盘
	var tripReview reviewentity.TripReviewEntity
	if err := config.DB.Where("trip_id = ?", query.TripID).First(&tripReview).Error; err != nil {
		Response.Error(c, http.StatusNotFound, "复盘不存在")
		return
	}

	// 查询酒店评分
	var hotelReviews []reviewentity.HotelReviewEntity
	config.DB.Where("trip_review_id = ?", tripReview.ID).Find(&hotelReviews)

	// 构建花费明细
	costBreakdown := CostBreakdownDetail{
		Total:       tripReview.TotalCost,
		Hotel:       tripReview.HotelCost,
		Transport:   tripReview.TransportCost,
		Activity:    tripReview.ActivityCost,
		Budget:      trip.Budget,
		Diff:        tripReview.BudgetDiff,
		DiffPercent: calculateDiffPercent(tripReview.BudgetDiff, trip.Budget),
	}

	Response.Success(c, "获取复盘详情成功", ReviewDetailResponse{
		TripReview:    tripReview,
		HotelReviews:  hotelReviews,
		CostBreakdown: costBreakdown,
	})
}

// GetUserStats 获取用户所有复盘的统计数据
// @Summary 获取用户复盘统计
// @Description 获取用户所有复盘的统计数据
// @Tags Review
// @Accept json
// @Produce json
// @Success 200 {object} UserStatsResponse "获取成功"
// @Router /api/v1/review/stats [get]
func GetUserStats(c *gin.Context) {
	userID := c.GetUint("userId")

	// 获取用户所有已完成的复盘
	var reviews []reviewentity.TripReviewEntity
	err := config.DB.Where("trip_id IN (?)",
		config.DB.Model(&tripentity.TripEntity{}).Select("id").Where("creator = ?", userID),
	).Where("status = 1").Find(&reviews).Error

	if err != nil {
		Response.Error(c, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}

	if len(reviews) == 0 {
		Response.Success(c, "获取统计成功", UserStatsResponse{
			TotalReviews:    0,
			AvgOverallRating: 0,
			AvgHotelRating:   0,
			AvgPriceRating:   0,
			TotalSaved:       0,
			TotalOverspent:   0,
		})
		return
	}

	// 计算统计数据
	var totalOverallRating int
	var totalHotelRating int
	var totalPriceRating int
	var totalSaved int
	var totalOverspent int
	var hotelReviewCount int

	for _, review := range reviews {
		totalOverallRating += int(review.OverallRating)

		if review.BudgetDiff > 0 {
			totalSaved += review.BudgetDiff
		} else {
			totalOverspent += -review.BudgetDiff
		}

		// 获取酒店评分
		var hotelReviews []reviewentity.HotelReviewEntity
		config.DB.Where("trip_review_id = ?", review.ID).Find(&hotelReviews)
		for _, hr := range hotelReviews {
			totalHotelRating += int(hr.OverallRating)
			totalPriceRating += int(hr.PriceRating)
			hotelReviewCount++
		}
	}

	stats := UserStatsResponse{
		TotalReviews:    len(reviews),
		AvgOverallRating: float64(totalOverallRating) / float64(len(reviews)),
		TotalSaved:       totalSaved,
		TotalOverspent:   totalOverspent,
	}

	if hotelReviewCount > 0 {
		stats.AvgHotelRating = float64(totalHotelRating) / float64(hotelReviewCount)
		stats.AvgPriceRating = float64(totalPriceRating) / float64(hotelReviewCount)
	}

	Response.Success(c, "获取统计成功", stats)
}

// ============== 辅助函数 ==============

// calculateCostBreakdown 计算花费明细
func calculateCostBreakdown(tripID uint) CostBreakdownDetail {
	var activities []activityentity.ActivityEntity
	config.DB.Where("trip_id = ?", tripID).Find(&activities)

	var totalCost, hotelCost, transportCost, activityCost uint
	for _, act := range activities {
		totalCost += act.Cost
		hotelCost += act.HotelCost
		transportCost += act.TransportCost
		// 活动门票 = 总花费 - 酒店 - 交通
		activityCost += act.Cost - act.HotelCost - act.TransportCost
	}

	// 获取预算
	var trip tripentity.TripEntity
	config.DB.First(&trip, tripID)

	return CostBreakdownDetail{
		Total:     totalCost,
		Hotel:     hotelCost,
		Transport: transportCost,
		Activity:  activityCost,
		Budget:    trip.Budget,
		Diff:      int(trip.Budget) - int(totalCost),
	}
}

// calculateDiffPercent 计算差异百分比
func calculateDiffPercent(diff int, budget uint) float64 {
	if budget == 0 {
		return 0
	}
	return float64(diff) / float64(budget) * 100
}