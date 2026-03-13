package config

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	db, err := gorm.Open(mysql.Open(AppConfig.Mysql.Dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold: time.Second,
				LogLevel:      logger.Info,
				Colorful:      true,
			},
		),
	})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
		panic(err)
	}

	sqlDB, _ := db.DB()
	if err := sqlDB.Ping(); err != nil {
		log.Fatal("数据库Ping 失败:", err)
	}

	DB = db

	if isDev() {
		AutoMigrate()
	}

	return db
}
