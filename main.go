package main

import (
	"travel-assistant/src/common/config"
	"travel-assistant/src/common/logger"
	"travel-assistant/src/router"

	_ "travel-assistant/docs" // swagger 文档（自动生成）
)

// @title           Travel Assistant API
// @version         1.0
// @description     旅游助手 API 文档
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	// 初始化配置
	config.Init()

	// 初始化数据库
	config.InitDB()

	// 初始化日志
	logger.InitLogger()
	defer logger.Logger.Sync()

	// 启动服务
	r := router.SetupRouter()
	r.Run(":8080")
}
