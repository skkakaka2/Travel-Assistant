package entity

import "time"

type UserEntity struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"userName"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"`
	Email     string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Phone     string    `gorm:"type:varchar(20)" json:"phone"`
	Avatar    string    `gorm:"type:varchar(255)" json:"avatar"`
	Status    int8      `gorm:"type:tinyint;default:1" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (UserEntity) TableName() string {
	return "users"
}
