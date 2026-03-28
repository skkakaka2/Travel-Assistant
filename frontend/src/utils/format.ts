/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  }
  if (format === 'YYYY-MM-DD HH:mm') {
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
  return `${year}-${month}-${day}`
}

/**
 * 格式化金额
 */
export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

/**
 * 格式化距离（米转公里）
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}

/**
 * 格式化时长（秒转小时分钟）
 */
export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}分钟`
  }
  if (minutes === 0) {
    return `${hours}小时`
  }
  return `${hours}小时${minutes}分钟`
}

/**
 * 获取行程状态标签
 */
export function getTripStatusTag(status: number): { text: string; color: string } {
  const statusMap = {
    0: { text: '未开始', color: 'info' },
    1: { text: '进行中', color: 'warning' },
    2: { text: '已完成', color: 'success' },
    3: { text: '已取消', color: 'danger' }
  }
  return statusMap[status as keyof typeof statusMap] || { text: '未知', color: 'info' }
}

/**
 * 获取活动状态标签
 */
export function getActivityStatusTag(status: number): { text: string; color: string } {
  const statusMap = {
    0: { text: '进行中', color: 'success' },
    1: { text: '已取消', color: 'danger' },
    2: { text: '已结束', color: 'info' }
  }
  return statusMap[status as keyof typeof statusMap] || { text: '未知', color: 'info' }
}

/**
 * 获取费用类型标签
 */
export function getExpenseTypeTag(type: number): { text: string; icon: string } {
  const typeMap = {
    1: { text: '油费', icon: '⛽' },
    2: { text: '过路费', icon: '🛣️' },
    3: { text: '停车费', icon: '🅿️' },
    4: { text: '维修费', icon: '🔧' },
    5: { text: '其他', icon: '💰' }
  }
  return typeMap[type as keyof typeof typeMap] || { text: '未知', icon: '💰' }
}