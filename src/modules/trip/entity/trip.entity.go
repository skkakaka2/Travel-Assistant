package tripentity

import (
	activityentity "travel-assistant/src/modules/activity/entity"
	commonentity "travel-assistant/src/modules/common/entity"
)

type TripEntity struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Title     string `gorm:"type:varchar(255);not null" json:"title"`
	UserCount int    `gorm:"type:int;not null" json:"userCount"`
	// 预算
	Budget uint `gorm:"type:uint;not null" json:"budget"`
	Cost   uint `gorm:"type:uint;not null" json:"cost"`
	//是否超预算
	IsOverBudget uint   `gorm:"type:uint;not null" json:"isOverBudget"`
	Description  string `gorm:"type:text;not null" json:"description"`
	StartDate    string `gorm:"type:varchar(255);not null" json:"startDate"`
	EndDate      string `gorm:"type:varchar(255);not null" json:"endDate"`
	Creator      uint   `gorm:"type:int(255);not null" json:"creator"`
	// 关联关系 - 行程有多个活动
	Activities []activityentity.ActivityEntity `gorm:"foreignKey:TripID;references:ID;constraint:OnDelete:CASCADE" json:"activities,omitempty"`

	commonentity.CommonEntity
}

func (TripEntity) TableName() string {
	return "trips"
}
