package main

import (
	"fmt"
	"strconv"
	"travel-assistant/src/common/config"
	"travel-assistant/src/router"
)

func main() {
	config.Init()
	config.InitDB()
	fmt.Printf("%+v\n", config.AppConfig)
	router := router.SetupRouter()
	port := ":" + strconv.Itoa(config.AppConfig.Server.Port)
	router.Run(port)
}
