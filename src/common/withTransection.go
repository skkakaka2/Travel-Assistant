package common

import (
	"net/http"
	"travel-assistant/src/common/Response"
	"travel-assistant/src/common/config"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func WithTransection(c *gin.Context, fn func(tx *gorm.DB) error) error {
	tx := config.DB.Begin()
	if err := fn(tx); err != nil {
		tx.Rollback()
		Response.Error(c, http.StatusInternalServerError, err.Error())
		return err
	}
	tx.Commit()
	return nil
}
