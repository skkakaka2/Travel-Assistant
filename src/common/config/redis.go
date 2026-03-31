package config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"travel-assistant/src/common/logger"

	"github.com/redis/go-redis/v9"
)

// RedisClient Redis 客户端封装
type RedisClient struct {
	client *redis.Client
}

// Rdb 全局 Redis 实例（单例）
var Rdb *RedisClient

// InitRedis 初始化 Redis 连接
func InitRedis() error {
	if AppConfig.Redis.Addr == "" {
		logger.Sugar.Info("Redis 地址未配置，跳过初始化")
		return nil
	}

	client := redis.NewClient(&redis.Options{
		Addr:         AppConfig.Redis.Addr,
		Password:     AppConfig.Redis.Password,
		DB:           AppConfig.Redis.DB,
		PoolSize:     AppConfig.Redis.PoolSize,
		MinIdleConns: AppConfig.Redis.MinIdleConns,
		MaxRetries:   3,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolTimeout:  4 * time.Second,
	})

	// 验证连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Sugar.Info("Redis 连接失败", err)
		return fmt.Errorf("Redis 连接失败: %w", err)
	}

	Rdb = &RedisClient{client: client}
	logger.Sugar.Info("Redis 连接成功")
	return nil
}

// Close 关闭 Redis 连接
func (r *RedisClient) Close() error {
	if r.client != nil {
		return r.client.Close()
	}
	return nil
}

// ==================== String 操作 ====================

// Set 设置键值（带TTL）
func (r *RedisClient) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("序列化失败: %w", err)
	}
	return r.client.Set(ctx, key, data, ttl).Err()
}

// SetString 设置字符串值
func (r *RedisClient) SetString(ctx context.Context, key string, value string, ttl time.Duration) error {
	return r.client.Set(ctx, key, value, ttl).Err()
}

// Get 获取值并反序列化
func (r *RedisClient) Get(ctx context.Context, key string, dest any) error {
	data, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return ErrCacheMiss
		}
		return err
	}
	return json.Unmarshal(data, dest)
}

// GetString 获取字符串值
func (r *RedisClient) GetString(ctx context.Context, key string) (string, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", ErrCacheMiss
		}
		return "", err
	}
	return val, nil
}

// Delete 删除键
func (r *RedisClient) Delete(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists 检查键是否存在
func (r *RedisClient) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.client.Exists(ctx, keys...).Result()
}

// Expire 设置过期时间
func (r *RedisClient) Expire(ctx context.Context, key string, ttl time.Duration) error {
	return r.client.Expire(ctx, key, ttl).Err()
}

// TTL 获取剩余过期时间
func (r *RedisClient) TTL(ctx context.Context, key string) (time.Duration, error) {
	return r.client.TTL(ctx, key).Result()
}

// Incr 自增
func (r *RedisClient) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// IncrBy 自增指定值
func (r *RedisClient) IncrBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.IncrBy(ctx, key, value).Result()
}

// ==================== Hash 操作 ====================

// HSet 设置 Hash 字段
func (r *RedisClient) HSet(ctx context.Context, key string, field string, value any) error {
	return r.client.HSet(ctx, key, field, value).Err()
}

// HSetMap 批量设置 Hash
func (r *RedisClient) HSetMap(ctx context.Context, key string, values map[string]any) error {
	return r.client.HSet(ctx, key, values).Err()
}

// HGet 获取 Hash 字段
func (r *RedisClient) HGet(ctx context.Context, key, field string) (string, error) {
	val, err := r.client.HGet(ctx, key, field).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", ErrCacheMiss
		}
		return "", err
	}
	return val, nil
}

// HGetAll 获取整个 Hash
func (r *RedisClient) HGetAll(ctx context.Context, key string) (map[string]string, error) {
	return r.client.HGetAll(ctx, key).Result()
}

// HDel 删除 Hash 字段
func (r *RedisClient) HDel(ctx context.Context, key string, fields ...string) error {
	return r.client.HDel(ctx, key, fields...).Err()
}

// HExists 检查 Hash 字段是否存在
func (r *RedisClient) HExists(ctx context.Context, key, field string) (bool, error) {
	return r.client.HExists(ctx, key, field).Result()
}

// ==================== List 操作 ====================

// LPush 左侧推入
func (r *RedisClient) LPush(ctx context.Context, key string, values ...any) error {
	return r.client.LPush(ctx, key, values...).Err()
}

// RPush 右侧推入
func (r *RedisClient) RPush(ctx context.Context, key string, values ...any) error {
	return r.client.RPush(ctx, key, values...).Err()
}

// LPop 左侧弹出
func (r *RedisClient) LPop(ctx context.Context, key string) (string, error) {
	val, err := r.client.LPop(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", ErrCacheMiss
		}
		return "", err
	}
	return val, nil
}

// RPop 右侧弹出
func (r *RedisClient) RPop(ctx context.Context, key string) (string, error) {
	val, err := r.client.RPop(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", ErrCacheMiss
		}
		return "", err
	}
	return val, nil
}

// LRange 获取列表范围
func (r *RedisClient) LRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.LRange(ctx, key, start, stop).Result()
}

// LLen 获取列表长度
func (r *RedisClient) LLen(ctx context.Context, key string) (int64, error) {
	return r.client.LLen(ctx, key).Result()
}

// ==================== Set 操作 ====================

// SAdd 添加成员
func (r *RedisClient) SAdd(ctx context.Context, key string, members ...any) error {
	return r.client.SAdd(ctx, key, members...).Err()
}

// SRem 移除成员
func (r *RedisClient) SRem(ctx context.Context, key string, members ...any) error {
	return r.client.SRem(ctx, key, members...).Err()
}

// SIsMember 检查成员是否存在
func (r *RedisClient) SIsMember(ctx context.Context, key string, member any) (bool, error) {
	return r.client.SIsMember(ctx, key, member).Result()
}

// SMembers 获取所有成员
func (r *RedisClient) SMembers(ctx context.Context, key string) ([]string, error) {
	return r.client.SMembers(ctx, key).Result()
}

// SCard 获取成员数量
func (r *RedisClient) SCard(ctx context.Context, key string) (int64, error) {
	return r.client.SCard(ctx, key).Result()
}

// ==================== ZSet 操作 ====================

// ZAdd 添加成员（带分数）
func (r *RedisClient) ZAdd(ctx context.Context, key string, members ...redis.Z) error {
	return r.client.ZAdd(ctx, key, members...).Err()
}

// ZRange 按分数范围获取（升序）
func (r *RedisClient) ZRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.ZRange(ctx, key, start, stop).Result()
}

// ZRevRange 按分数范围获取（降序）
func (r *RedisClient) ZRevRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.ZRevRange(ctx, key, start, stop).Result()
}

// ZRangeByScore 按分数范围获取
func (r *RedisClient) ZRangeByScore(ctx context.Context, key string, opt *redis.ZRangeBy) ([]string, error) {
	return r.client.ZRangeByScore(ctx, key, opt).Result()
}

// ZRem 移除成员
func (r *RedisClient) ZRem(ctx context.Context, key string, members ...any) error {
	return r.client.ZRem(ctx, key, members...).Err()
}

// ZCard 获取成员数量
func (r *RedisClient) ZCard(ctx context.Context, key string) (int64, error) {
	return r.client.ZCard(ctx, key).Result()
}

// ==================== 批量操作（Pipeline）====================

// Pipeline 获取 Pipeline 对象
func (r *RedisClient) Pipeline() redis.Pipeliner {
	return r.client.Pipeline()
}

// WithPipeline 批量执行命令
func (r *RedisClient) WithPipeline(ctx context.Context, fn func(pipe redis.Pipeliner) error) error {
	pipe := r.client.Pipeline()
	if err := fn(pipe); err != nil {
		return err
	}
	_, err := pipe.Exec(ctx)
	return err
}

// ==================== 分布式锁 ====================

// Lock 获取分布式锁（简单实现，生产环境建议用 Redisson 或 Redlock）
func (r *RedisClient) Lock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	// NX: 只在键不存在时设置，XX: 只在键存在时设置
	// 使用 SetArgs 设置 NX 和过期时间，替代已废弃的 SetNX
	res, err := r.client.SetArgs(ctx, key, "1", redis.SetArgs{
		Mode: "NX",
		TTL:  ttl,
	}).Result()
	if err != nil {
		return false, err
	}
	return res == "OK", nil
}

// Unlock 释放分布式锁
func (r *RedisClient) Unlock(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// ==================== 安全扫描（替代 KEYS）====================

// Scan 安全扫描键（替代 KEYS 命令）
func (r *RedisClient) Scan(ctx context.Context, match string, count int64) ([]string, error) {
	var cursor uint64
	var keys []string

	for {
		var batch []string
		var err error
		batch, cursor, err = r.client.Scan(ctx, cursor, match, count).Result()
		if err != nil {
			return nil, err
		}
		keys = append(keys, batch...)
		if cursor == 0 {
			break
		}
	}
	return keys, nil
}

// DeleteByPattern 按模式删除键（使用 SCAN + DEL，安全）
func (r *RedisClient) DeleteByPattern(ctx context.Context, pattern string) error {
	keys, err := r.Scan(ctx, pattern, 100)
	if err != nil {
		return err
	}
	if len(keys) > 0 {
		return r.client.Del(ctx, keys...).Err()
	}
	return nil
}

// ==================== 缓存模式 ====================

// CacheAside Cache-Aside 模式：先查缓存，未命中则查数据源并写入缓存
func CacheAside[T any](ctx context.Context, key string, ttl time.Duration, fetch func() (T, error)) (T, error) {
	var result T
	var zero T

	// 1. 查缓存
	if err := Rdb.Get(ctx, key, &result); err == nil {
		return result, nil // 缓存命中
	} else if !errors.Is(err, ErrCacheMiss) {
		logger.Sugar.Warnw("Redis 查询失败", "key", key, "error", err)
	}

	// 2. 缓存未命中，查数据源
	data, err := fetch()
	if err != nil {
		return zero, err
	}

	// 3. 写入缓存（异步，不阻塞返回）
	go func() {
		bgCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		if err := Rdb.Set(bgCtx, key, data, ttl); err != nil {
			logger.Sugar.Warnw("Redis 写入失败", "key", key, "error", err)
		}
	}()

	return data, nil
}

// InvalidateCache 使缓存失效（删除）
func InvalidateCache(ctx context.Context, keys ...string) {
	if err := Rdb.Delete(ctx, keys...); err != nil {
		logger.Sugar.Warnw("缓存失效失败", "keys", keys, "error", err)
	}
}

// ==================== 错误定义 ====================

var ErrCacheMiss = errors.New("cache miss")

// GetTTLWithJitter 获取带随机抖动的 TTL，防止缓存雪崩
// baseTTL: 基础过期时间
// maxJitter: 最大随机抖动时间
func GetTTLWithJitter(baseTTL, maxJitter time.Duration) time.Duration {
	if maxJitter <= 0 {
		return baseTTL
	}
	jitter := time.Duration(rand.Int63n(int64(maxJitter)))
	return baseTTL + jitter
}
