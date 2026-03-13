package config

import (
	"time"
	"travel-assistant/src/common/logger"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// securityUtils 密码工具（单例模式）
var SecurityUtils = &securityUtils{}

type securityUtils struct{}

func (p *securityUtils) EncodePassword(password string) string {
	logger.Sugar.Info("密码", password)
	logger.Sugar.Info("字节", []byte(password))
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		logger.Sugar.Error("密码加密失败", err)
		panic(err)
	}
	return string(hashedPassword)
}

func (p *securityUtils) ComparePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false
	}
	return true
}

func (p *securityUtils) GenerateToken(userID uint, userName string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       userID,
		"username": userName,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString([]byte(AppConfig.Jwt.Secret))
	if err != nil {
		logger.Sugar.Error("生成Token失败", err)
		panic(err)
	}
	return tokenString
}

func (p *securityUtils) VerifyToken(tokenString string) bool {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(AppConfig.Jwt.Secret), nil
	})
	if err != nil {
		return false
	}
	if !token.Valid {
		return false
	}
	return true
}

func (p *securityUtils) GetTokenClaims(tokenString string) jwt.MapClaims {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(AppConfig.Jwt.Secret), nil
	})
	if err != nil {
		return nil
	}
	return token.Claims.(jwt.MapClaims)
}
