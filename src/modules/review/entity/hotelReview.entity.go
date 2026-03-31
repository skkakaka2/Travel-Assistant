package reviewentity

import commonentity "travel-assistant/src/modules/common/entity"

type HotelReviewEntity struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	TripReviewID uint `gorm:"index;not null" json:"tripReviewId"`    // 关联复盘
	ActivityID   uint `gorm:"index;not null" json:"activityId"`      // 关联活动（酒店信息来源）
	HotelName    string `gorm:"type:varchar(255)" json:"hotelName"`    // 酒店名称（快照）

	// 评分维度
	OverallRating int8 `gorm:"default:0" json:"overallRating"`        // 整体满意度 1-5
	PriceRating   int8 `gorm:"default:0" json:"priceRating"`          // 价格性价比 1-5
	Comment       string `gorm:"type:text" json:"comment"`              // 评价内容

	commonentity.CommonEntity
}

func (HotelReviewEntity) TableName() string {
	return "hotel_reviews"
}