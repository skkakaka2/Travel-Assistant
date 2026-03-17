package entity

import (
	"time"

	activity "travel-assistant/src/modules/activity/entity"
)

type TripEntity struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Title     string `gorm:"type:varchar(255);not null" json:"title"`
	UserCount int    `gorm:"type:int;not null" json:"userCount"`
	// 预算
	Budget      float64   `gorm:"type:int;not null" json:"budget"`
	Cost        uint      `gorm:"type:uint;not null" json:"cost"`
	Description string    `gorm:"type:text;not null" json:"description"`
	StartDate   string    `gorm:"type:varchar(255);not null" json:"startDate"`
	EndDate     string    `gorm:"type:varchar(255);not null" json:"endDate"`
	Creator     uint      `gorm:"type:int(255);not null" json:"creator"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// 关联关系 - 行程有多个活动
	Activities []activity.ActivityEntity `gorm:"foreignKey:TripID;references:ID;constraint:OnDelete:CASCADE" json:"activities,omitempty"`
}

func (TripEntity) TableName() string {
	return "trips"
}
