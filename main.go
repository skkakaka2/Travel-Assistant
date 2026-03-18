package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
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
	defer logger.Logger.Sync()

	// 启动服务
	r := router.SetupRouter()
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}
	go func() {
		srv.ListenAndServe()
		fmt.Println("服务启动成功")
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}
