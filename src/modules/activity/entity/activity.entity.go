package entity

import "time"

type ActivityEntity struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	TripID       uint   `gorm:"index;not null" json:"tripId"`                   // 关联的行程ID
	Title        string `gorm:"type:varchar(255);not null" json:"title"`        // 活动标题
	Description  string `gorm:"type:text" json:"description"`                   // 活动描述
	ActivityDate string `gorm:"type:varchar(255);not null" json:"activityDate"` // 活动日期(yyyy-MM-dd)
	StartTime    string `gorm:"type:varchar(50)" json:"startTime"`              // 开始时间(HH:mm)
	EndTime      string `gorm:"type:varchar(50)" json:"endTime"`                // 结束时间(HH:mm)
	Location     string `gorm:"type:varchar(500)" json:"location"`              // 活动地点
	Cost         uint   `gorm:"type:uint;not null" json:"cost"`                 // 总费用

	Longitude float64 `gorm:"type:decimal(10,8);not null" json:"longitude"`
	Latitude  float64 `gorm:"type:decimal(10,8);not null" json:"latitude"`

	Hotel         string `gorm:"type:varchar(255)" json:"hotel"`          // 酒店
	HotelAddress  string `gorm:"type:varchar(255)" json:"hotelAddress"`   // 酒店地址
	HotelCost     uint   `gorm:"type:uint;not null" json:"hotelCost"`     // 酒店费用
	TransportType string `gorm:"type:varchar(255)" json:"transportType"`  // 交通方式
	TransportCost uint   `gorm:"type:uint;not null" json:"transportCost"` // 交通费用

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (ActivityEntity) TableName() string {
	return "activities"
}
