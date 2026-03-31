package user

import (
	"net/http"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"
	userentity "travel-assistant/src/modules/user/entity"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"` // 必填，3-20位字母数字
	Password string `json:"password" binding:"required,min=6,max=20"` // 必填，6-20位
	Phone    string `json:"phone" binding:"omitempty,len=11,numeric"` // 可选，11位数字
}

type RegisterResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"userName"`
	Phone    string `json:"phone"`
}

type UpdateUserRequest struct {
	Phone            string  `json:"phone" binding:"omitempty,len=11,numeric"` // 可选，11位数字
	Car              string  `json:"car" binding:"omitempty,max=255"`
	CarNumber        string  `json:"carNumber" binding:"omitempty,max=255"`
	PerKilometerCost uint    `json:"perKilometerCost" binding:"omitempty,min=0"`
	Home             string  `json:"home" binding:"omitempty,max=255"`
	HomeAddress      string  `json:"homeAddress" binding:"omitempty,max=255"`
	HomeLongitude    float64 `json:"homeLongitude" binding:"omitempty,longitude,decimal6"`
	HomeLatitude     float64 `json:"homeLatitude" binding:"omitempty,latitude,decimal6"`
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
	if !Response.BindJSON(c, &request) {
		return
	}

	user := userentity.UserEntity{
		Username: request.Username,
		Password: request.Password,
		Phone:    request.Phone,
	}

	user.Password = config.SecurityUtils.EncodePassword(user.Password)

	result := config.DB.Create(&user)

	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, result.Error.Error())
		return
	}

	Response.Success(c, "注册成功", user)
}

// @Summary 更新用户
// @Description 更新用户
// @Tags User
// @Accept json
// @Produce json
// @Param request body UpdateUserRequest true "更新用户请求"
// @Success 200 {object} userentity.UserEntity "更新用户成功"
// @Router /api/v1/user/update [put]
func UpdateUser(c *gin.Context) {
	request := UpdateUserRequest{}
	if !Response.BindJSON(c, &request) {
		Response.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	user := userentity.UserEntity{}
	userId, exists := c.Get("userId")
	if !exists {
		Response.Error(c, http.StatusUnauthorized, "未登录")
		return
	}
	if err := config.DB.Model(&user).Where("id = ?", userId).First(&user).Error; err != nil {
		Response.Error(c, http.StatusInternalServerError, "用户不存在: "+err.Error())
		return
	}

	copier.Copy(&user, &request)

	result := config.DB.Model(&user).Where("id = ?", userId).Updates(user)
	if result.Error != nil {
		Response.Error(c, http.StatusInternalServerError, "更新用户失败: "+result.Error.Error())
		return
	}

	Response.Success(c, "更新用户成功", user)

}
