package entity

import "time"

type ActivityRouteEntity struct {
	ID uint `gorm:"primaryKey" json:"id"`
	//起点活动id
	StartActivityID uint `gorm:"index;not null" json:"startActivityId"`
	//终点活动id
	EndActivityID uint      `gorm:"index;not null" json:"endActivityId"`
	TripID        uint      `gorm:"index;not null" json:"tripId"`
	Distance      float64   `gorm:"type:decimal(10,8);not null" json:"distance"`
	Duration      float64   `gorm:"type:decimal(10,8);not null" json:"duration"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (ActivityRouteEntity) TableName() string {
	return "activity_routes"
}
