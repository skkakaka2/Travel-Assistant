package config

import (
	"fmt"
	activity "travel-assistant/src/modules/activity/entity"
	trip "travel-assistant/src/modules/trip/entity"
	user "travel-assistant/src/modules/user/entity"
)

func AutoMigrate() {
	fmt.Println("开始自动迁移数据库")

	DB.AutoMigrate(&user.UserEntity{})
	DB.AutoMigrate(&trip.TripEntity{})
	DB.AutoMigrate(&activity.ActivityEntity{})

	fmt.Println("自动迁移数据库完成")
}
