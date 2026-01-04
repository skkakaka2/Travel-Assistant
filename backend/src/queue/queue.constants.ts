/**
 * 队列常量定义
 */

// 队列名称
export const QUEUE_NAMES = {
  // 距离计算队列
  DISTANCE_CALCULATION: 'distance-calculation',
} as const;

// 任务名称
export const JOB_NAMES = {
  // 计算单个 item 到前一个 item 的距离
  CALCULATE_ITEM_DISTANCE: 'calculate-item-distance',
  // 计算整个 dayPlan 的所有 item 距离
  CALCULATE_DAY_PLAN_DISTANCE: 'calculate-day-plan-distance',
} as const;

// 队列类型
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

