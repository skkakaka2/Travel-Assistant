package auth

import (
	"net/http"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	userentity "travel-assistant/src/modules/user/entity"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"` // 必填，3-20位字母数字
	Password string `json:"password" binding:"required,min=6,max=20"` // 必填，6-20位
}

type LoginResponse struct {
	Token string                `json:"token"`
	User  userentity.UserEntity `json:"user"`
}

// @Summary 登录
// @Description 登录
// @Tags User
// @Accept json
// @Produce json
// @Param request body LoginRequest true "登录请求"
// @Success 200 {object} userentity.UserEntity "登录成功"
// @Router /api/v1/user/login [post]
func Login(c *gin.Context) {
	request := LoginRequest{}
	if !Response.BindJSON(c, &request) {
		return
	}

	user := userentity.UserEntity{
		Username: request.Username,
		Password: request.Password,
	}

	result := config.DB.Where("username = ?", request.Username).First(&user)

	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}
	if !config.SecurityUtils.ComparePassword(user.Password, request.Password) {
		Response.Error(c, http.StatusUnauthorized, "密码错误")
		return
	}

	token := config.SecurityUtils.GenerateToken(user.ID, user.Username)

	c.SetCookie("travel_assistant_token", token, 60*60*24*30, "/", "", false, true)

	Response.Success(c, "登录成功", LoginResponse{
		Token: token,
		User:  user,
	})
}
