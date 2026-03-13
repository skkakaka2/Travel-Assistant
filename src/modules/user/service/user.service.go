package user

import (
	"net/http"
	"travel-assistant/src/common/config"
	"travel-assistant/src/common/response"
	"travel-assistant/src/modules/user/entity"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"` // 必填，3-20位字母数字
	Password string `json:"password" binding:"required,min=6,max=20"` // 必填，6-20位
	Email    string `json:"email" binding:"required,email"`           // 必填，邮箱格式
	Phone    string `json:"phone" binding:"omitempty,len=11,numeric"` // 可选，11位数字
	Avatar   string `json:"avatar" binding:"omitempty,url"`           // 可选，URL格式
}

type LoginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"` // 必填，3-20位字母数字
	Password string `json:"password" binding:"required,min=6,max=20"` // 必填，6-20位
}

type RegisterResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Avatar   string `json:"avatar"`
}

type LoginResponse struct {
	Token string            `json:"token"`
	User  entity.UserEntity `json:"user"`
}

// @Summary 注册用户
// @Description 注册用户
// @Tags User
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "注册请求"
// @Success 200 {object} RegisterResponse "注册成功"
// @Router /api/v1/user/register [post]
func Register(c *gin.Context) {
	request := RegisterRequest{}

	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user := entity.UserEntity{
		Username: request.Username,
		Password: request.Password,
		Email:    request.Email,
		Phone:    request.Phone,
		Avatar:   request.Avatar,
	}

	user.Password = config.SecurityUtils.EncodePassword(user.Password)

	result := config.DB.Create(&user)

	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}

	response.Success(c, "注册成功", user)
}

// @Summary 登录
// @Description 登录
// @Tags User
// @Accept json
// @Produce json
// @Param request body LoginRequest true "登录请求"
// @Success 200 {object} entity.UserEntity "登录成功"
// @Router /api/v1/user/login [post]
func Login(c *gin.Context) {
	request := LoginRequest{}

	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user := entity.UserEntity{
		Username: request.Username,
		Password: request.Password,
	}

	result := config.DB.Where("username = ?", request.Username).First(&user)

	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}
	if !config.SecurityUtils.ComparePassword(user.Password, request.Password) {
		response.Error(c, http.StatusUnauthorized, "密码错误")
		return
	}

	token := config.SecurityUtils.GenerateToken(user.ID, user.Username)

	c.SetCookie("travel_assistant_token", token, 60*60*24*30, "/", "", false, true)

	response.Success(c, "登录成功", LoginResponse{
		Token: token,
		User:  user,
	})
}
