package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
)

// NullFilterMiddleware 过滤请求中的 null 参数
// 处理 Query 查询参数和 JSON 请求体中的 null 值
func NullFilterMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 处理 Query 参数
		filterQueryParams(c)

		// 处理 JSON Body（仅对有请求体的情况）
		if c.Request.Body != nil && c.Request.ContentLength > 0 {
			contentType := c.GetHeader("Content-Type")
			// 仅处理 JSON 类型的请求体
			if strings.Contains(contentType, "application/json") {
				filterJSONBody(c)
			}
		}

		c.Next()
	}
}

// filterQueryParams 过滤查询参数中的 null 值
func filterQueryParams(c *gin.Context) {
	query := c.Request.URL.Query()
	keysToRemove := make([]string, 0)

	for key, values := range query {
		for i, v := range values {
			// 删除值为空字符串或字符串 "null" 的参数
			if v == "" || strings.ToLower(v) == "null" {
				if len(values) == 1 {
					keysToRemove = append(keysToRemove, key)
				} else {
					// 多值情况，只移除该位置的值
					values = append(values[:i], values[i+1:]...)
					query[key] = values
				}
				break
			}
		}
	}

	// 删除需要移除的 key
	for _, key := range keysToRemove {
		query.Del(key)
	}

	c.Request.URL.RawQuery = query.Encode()
}

// filterJSONBody 过滤 JSON 请求体中的 null 字段
func filterJSONBody(c *gin.Context) {
	// 读取请求体
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return
	}

	// 解析 JSON
	var data map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		// 如果不是 JSON 对象，可能是数组或其他格式，原样放回
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		return
	}

	// 递归删除 null 字段
	removeNullFields(data)

	// 重新编码
	filteredBytes, err := json.Marshal(data)
	if err != nil {
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		return
	}

	// 设置新的请求体
	c.Request.Body = io.NopCloser(bytes.NewBuffer(filteredBytes))
	c.Request.ContentLength = int64(len(filteredBytes))
}

// removeNullFields 递归删除 map 中的 null 字段
func removeNullFields(data map[string]interface{}) {
	for key, value := range data {
		// 删除值为 nil 的字段
		if value == nil {
			delete(data, key)
			continue
		}

		// 递归处理嵌套的 map
		if nestedMap, ok := value.(map[string]interface{}); ok {
			removeNullFields(nestedMap)
			// 如果嵌套 map 被清空，也删除
			if len(nestedMap) == 0 {
				delete(data, key)
			}
			continue
		}

		// 处理嵌套的 slice/array
		if slice, ok := value.([]interface{}); ok {
			removeNullFieldsFromSlice(slice)
		}
	}
}

// removeNullFieldsFromSlice 处理 slice 中的 null 值和嵌套结构
func removeNullFieldsFromSlice(slice []interface{}) {
	for i, item := range slice {
		if item == nil {
			continue // 保留 slice 中的 nil，保持索引一致
		}

		if nestedMap, ok := item.(map[string]interface{}); ok {
			removeNullFields(nestedMap)
		}

		if nestedSlice, ok := item.([]interface{}); ok {
			removeNullFieldsFromSlice(nestedSlice)
		}

		_ = i // 索引暂未使用
	}
}
