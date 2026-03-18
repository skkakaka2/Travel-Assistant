package main

import (
	"context"
	"fmt"
	"time"
	"travel-assistant/src/common/config"

	"github.com/redis/go-redis/v9"
)

// Redis 使用示例
func redisExample() {
	ctx := context.Background()

	// ==================== String 操作 ====================

	// 设置缓存（10分钟过期）
	user := map[string]any{
		"id":   1,
		"name": "张三",
		"age":  25,
	}
	err := config.Rdb.Set(ctx, "user:1", user, 10*time.Minute)
	if err != nil {
		fmt.Println("设置缓存失败:", err)
	}

	// 获取缓存
	var cachedUser map[string]any
	if err := config.Rdb.Get(ctx, "user:1", &cachedUser); err == nil {
		fmt.Println("缓存命中:", cachedUser)
	} else {
		fmt.Println("缓存未命中或错误:", err)
	}

	// 设置字符串（带TTL）
	config.Rdb.SetString(ctx, "token:user:1", "abc123", 24*time.Hour)

	// 获取字符串
	token, _ := config.Rdb.GetString(ctx, "token:user:1")
	fmt.Println("Token:", token)

	// 删除
	config.Rdb.Delete(ctx, "user:1")

	// ==================== Hash 操作 ====================

	// 存储用户配置
	config.Rdb.HSetMap(ctx, "config:user:1", map[string]any{
		"theme":       "dark",
		"language":    "zh-CN",
		"notifications": true,
	})

	// 获取单个字段
	theme, _ := config.Rdb.HGet(ctx, "config:user:1", "theme")
	fmt.Println("主题:", theme)

	// 获取整个 Hash
	allConfig, _ := config.Rdb.HGetAll(ctx, "config:user:1")
	fmt.Println("所有配置:", allConfig)

	// ==================== List 操作 ====================

	// 消息队列（LPush 生产，RPop 消费）
	config.Rdb.LPush(ctx, "queue:notifications",
		`{"userId":1,"message":"新消息1"}`,
		`{"userId":2,"message":"新消息2"}`,
	)

	// 消费消息
	msg, err := config.Rdb.RPop(ctx, "queue:notifications")
	if err == nil {
		fmt.Println("消费消息:", msg)
	}

	// ==================== Set 操作 ====================

	// 存储用户标签
	config.Rdb.SAdd(ctx, "tags:user:1", "旅行", "美食", "摄影")

	// 检查标签
	isTraveler, _ := config.Rdb.SIsMember(ctx, "tags:user:1", "旅行")
	fmt.Println("是旅行者:", isTraveler)

	// 获取所有标签
	tags, _ := config.Rdb.SMembers(ctx, "tags:user:1")
	fmt.Println("用户标签:", tags)

	// ==================== ZSet 操作 ====================

	// 排行榜（按分数排序）
	config.Rdb.ZAdd(ctx, "ranking:score",
		redis.Z{Score: 100, Member: "user1"},
		redis.Z{Score: 95, Member: "user2"},
		redis.Z{Score: 88, Member: "user3"},
	)

	// 获取前10名
	top10, _ := config.Rdb.ZRevRange(ctx, "ranking:score", 0, 9)
	fmt.Println("排行榜:", top10)

	// ==================== Pipeline 批量操作 ====================

	config.Rdb.WithPipeline(ctx, func(pipe redis.Pipeliner) error {
		for i := 1; i <= 100; i++ {
			pipe.Set(ctx, fmt.Sprintf("batch:key:%d", i), i, time.Hour)
		}
		return nil
	})
	fmt.Println("批量写入完成")

	// ==================== 分布式锁 ====================

	lockKey := "lock:order:123"
	locked, _ := config.Rdb.Lock(ctx, lockKey, 30*time.Second)
	if locked {
		fmt.Println("获取锁成功")
		// 执行业务逻辑...

		// 释放锁
		config.Rdb.Unlock(ctx, lockKey)
		fmt.Println("释放锁")
	} else {
		fmt.Println("获取锁失败，已有其他进程在处理")
	}

	// ==================== 安全扫描删除 ====================

	// 安全删除所有 user:* 的键（使用 SCAN，不会阻塞）
	config.Rdb.DeleteByPattern(ctx, "user:*")

	// ==================== Cache-Aside 模式 ====================

	// 封装好的缓存模式：自动处理缓存命中/未命中
	trips, err := config.CacheAside(ctx, "trips:user:1", 5*time.Minute, func() ([]Trip, error) {
		// 缓存未命中时执行：查询数据库
		return getTripsFromDB(1)
	})
	if err != nil {
		fmt.Println("获取行程失败:", err)
	} else {
		fmt.Println("行程列表:", trips)
	}

	// 使缓存失效
	config.InvalidateCache(ctx, "trips:user:1")
}

// 模拟从数据库查询
type Trip struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func getTripsFromDB(userID int) ([]Trip, error) {
	// 实际项目中这里是数据库查询
	return []Trip{
		{ID: 1, Name: "北京之旅"},
		{ID: 2, Name: "上海之旅"},
	}, nil
}

// 注意：需要 import "github.com/redis/go-redis/v9"
