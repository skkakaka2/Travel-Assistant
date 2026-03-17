package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type GlobalConfig struct {
	Server struct {
		Port int `mapstructure:"port"`
	} `mapstructure:"server"`
	Jwt struct {
		Secret string `mapstructure:"secret"`
	} `mapstructure:"jwt"`
	Mysql struct {
		Host string `mapstructure:"host"`
		Port int    `mapstructure:"port"`
		Dsn  string `mapstructure:"dsn"`
	} `mapstructure:"mysql"`
	BaiduMap struct {
		Key      string `mapstructure:"key"`
		BasePath string `mapstructure:"basePath"`
	} `mapstructure:"baiduMap"`
}

var AppConfig GlobalConfig

func Init() {
	// 1. 加载 .env 文件
	if isDev() {
		godotenv.Load(".env.development")
	} else {
		godotenv.Load(".env.production")
	}

	viperIns := viper.New()
	viperIns.SetConfigName("config")
	viperIns.SetConfigType("yaml")
	viperIns.AddConfigPath(".")

	// 2. 环境变量配置
	viperIns.AutomaticEnv()
	viperIns.SetEnvPrefix("APP")
	viperIns.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// 3. 读取配置文件
	if err := viperIns.ReadInConfig(); err != nil {
		panic("读取配置文件失败:" + err.Error())
	}

	// ✅ 4. 显式绑定环境变量（关键！）
	bindEnvs(viperIns)

	// 5. 解析到结构体
	if err := viperIns.Unmarshal(&AppConfig); err != nil {
		panic("解析配置文件失败:" + err.Error())
	}

	// 调试输出
	fmt.Printf("[CONFIG] Server.Port: %d\n", AppConfig.Server.Port)
	fmt.Printf("[CONFIG] Jwt.Secret: %s\n", AppConfig.Jwt.Secret)
	fmt.Printf("[CONFIG] Mysql.Host: %s\n", AppConfig.Mysql.Host)
}

// 绑定环境变量到配置键
func bindEnvs(v *viper.Viper) {
	v.BindEnv("server.port", "APP_SERVER_PORT")
	v.BindEnv("jwt.secret", "APP_JWT_SECRET")
	v.BindEnv("mysql.host", "APP_MYSQL_HOST")
	v.BindEnv("mysql.port", "APP_MYSQL_PORT")
	v.BindEnv("mysql.dsn", "APP_MYSQL_DSN")
}

func getEnv() string {
	env := os.Getenv("GO_ENV")
	fmt.Println("当前环境:", env)
	if env == "" {
		return "development"
	}
	return env
}

func isDev() bool {
	return getEnv() == "development"
}

func isProd() bool {
	return getEnv() == "production"
}
