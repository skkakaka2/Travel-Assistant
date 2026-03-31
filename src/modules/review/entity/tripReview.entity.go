package reviewentity

import commonentity "travel-assistant/src/modules/common/entity"

type TripReviewEntity struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	TripID uint `gorm:"uniqueIndex;not null" json:"tripId"` // 关联行程
	Status int8 `gorm:"default:0" json:"status"`            // 0=待复盘, 1=已完成

	// 花费统计（从 Activity 自动汇总）
	TotalCost    uint `gorm:"type:uint;not null;default:0" json:"totalCost"`    // 总实际花费
	HotelCost    uint `gorm:"type:uint;not null;default:0" json:"hotelCost"`    // 酒店花费
	TransportCost uint `gorm:"type:uint;not null;default:0" json:"transportCost"` // 交通花费
	ActivityCost uint `gorm:"type:uint;not null;default:0" json:"activityCost"`  // 活动门票花费
	BudgetDiff   int  `gorm:"type:int;not null;default:0" json:"budgetDiff"`   // 预算差异 = Budget - TotalCost

	// 用户填写
	OverallRating  int8   `gorm:"default:0" json:"overallRating"`        // 行程整体评分 1-5
	OverallComment string `gorm:"type:text" json:"overallComment"`       // 行程总结

	commonentity.CommonEntity
}

func (TripReviewEntity) TableName() string {
	return "trip_reviews"
}