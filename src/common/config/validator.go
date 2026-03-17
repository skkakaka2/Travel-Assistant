package config

// 在初始化时注册
import (
	"fmt"
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func InitValidator() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 经度验证：-180 到 180，最多 6 位小数
		v.RegisterValidation("longitude", func(fl validator.FieldLevel) bool {
			val := fl.Field().Float()
			if val < -180 || val > 180 {
				return false
			}
			return true
		})

		// 纬度验证：-90 到 90，最多 6 位小数
		v.RegisterValidation("latitude", func(fl validator.FieldLevel) bool {
			val := fl.Field().Float()
			if val < -90 || val > 90 {
				return false
			}
			return true
		})

		// 通用小数位数验证（正则方式）
		v.RegisterValidation("decimal6", func(fl validator.FieldLevel) bool {
			str := fmt.Sprintf("%v", fl.Field().Float())
			matched, _ := regexp.MatchString(`^-?\d+(\.\d{1,6})?$`, str)
			return matched
		})
	}
}
