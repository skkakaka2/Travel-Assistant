import type { QueueOptions, JobsOptions } from 'bullmq';

/**
 * Redis 连接配置
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

/**
 * 从环境变量获取 Redis 配置
 */
export function getRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '1', 10),
  };
}

/**
 * 获取队列默认配置
 */
export function getQueueOptions(): QueueOptions {
  const redisConfig = getRedisConfig();

  return {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
    },
    defaultJobOptions: getDefaultJobOptions(),
  };
}

/**
 * 获取默认任务配置
 */
export function getDefaultJobOptions(): JobsOptions {
  return {
    // 任务失败后重试次数
    attempts: parseInt(process.env.QUEUE_JOB_ATTEMPTS || '3', 10),
    // 重试延迟策略（指数退避）
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    // 任务完成后保留数量
    removeOnComplete: {
      count: 100,
      age: 24 * 60 * 60, // 24 小时
    },
    // 任务失败后保留数量
    removeOnFail: {
      count: 500,
      age: 7 * 24 * 60 * 60, // 7 天
    },
  };
}

