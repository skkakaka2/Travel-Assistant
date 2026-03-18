package entity

import "travel-assistant/src/modules/common/entity"

type ActivityRouteEntity struct {
	ID uint `gorm:"primaryKey" json:"id"`
	//起点活动id
	StartActivityID uint `gorm:"index;not null" json:"startActivityId"`
	//终点活动id
	EndActivityID uint    `gorm:"index;not null" json:"endActivityId"`
	TripID        uint    `gorm:"index;not null" json:"tripId"`
	Distance      float64 `gorm:"type:decimal(10,1);not null" json:"distance"`
	Duration      int     `gorm:"type:int;not null" json:"duration"`

	entity.CommonEntity
}

func (ActivityRouteEntity) TableName() string {
	return "activity_routes"
}
