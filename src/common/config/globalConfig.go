package config

import (
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
		Host     string `mapstructure:"host"`
		Port     int    `mapstructure:"port"`
		Username string `mapstructure:"username"`
		Password string `mapstructure:"password"`
		Database string `mapstructure:"database"`
		Dsn      string `mapstructure:"dsn"`
	} `mapstructure:"mysql"`
}

var AppConfig GlobalConfig

func Init() {
	viperIns := viper.New()
	viperIns.SetConfigName("config")
	viperIns.SetConfigType("yaml")
	viperIns.AddConfigPath(".")
	if err := viperIns.ReadInConfig(); err != nil {
		panic(err)
	}
	if err := viperIns.Unmarshal(&AppConfig); err != nil {
		panic(err)
	}
}
