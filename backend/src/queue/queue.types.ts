/**
 * 队列消息类型定义
 */

/**
 * 计算单个 item 距离的任务数据
 */
export interface CalculateItemDistanceJob {
  // 当前 item 的 ID
  itemId: number;
  // 当前 item 所属的 dayPlan ID
  dayPlanId: number;
  // 当前 item 所属的 trip ID
  tripId: number;
  // 当前 item 的经纬度
  latitude: number;
  longitude: number;
  // 当前 item 的顺序
  order: number;
}

/**
 * 计算整个 dayPlan 所有 item 距离的任务数据
 */
export interface CalculateDayPlanDistanceJob {
  // dayPlan ID
  dayPlanId: number;
  // trip ID
  tripId: number;
}

/**
 * 距离计算结果
 */
export interface DistanceCalculationResult {
  // item ID
  itemId: number;
  // 计算出的距离（单位：米）
  distance: number;
  // 是否计算成功
  success: boolean;
  // 错误信息（如果失败）
  error?: string;
}

