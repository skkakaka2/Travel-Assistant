package entity

import "time"

type TripEntity struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Title     string `gorm:"type:varchar(255);not null" json:"title"`
	UserCount int    `gorm:"type:int;not null" json:"userCount"`
	// 预算
	Budget      float64   `gorm:"type:int;not null" json:"budget"`
	Description string    `gorm:"type:text;not null" json:"description"`
	StartDate   string    `gorm:"type:varchar(255);not null" json:"startDate"`
	EndDate     string    `gorm:"type:varchar(255);not null" json:"endDate"`
	Creator     uint      `gorm:"type:int(255);not null" json:"creator"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (TripEntity) TableName() string {
	return "trips"
}
