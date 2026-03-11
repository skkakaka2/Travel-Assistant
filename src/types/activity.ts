// 活动状态枚举
export enum ActivityStatus {
  PENDING = 0,
  ONGOING = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// 活动信息
export interface ActivityVO {
  id: number
  creatorId: number
  creatorNickname: string
  title: string
  description: string
  location: string
  longitude: number
  latitude: number
  startTime: string
  endTime: string
  maxParticipants: number
  currentParticipants: number
  status: ActivityStatus
  statusDesc: string
  joined: boolean
  createdAt: string
}

// 活动请求
export interface ActivityRequest {
  title: string
  description?: string
  location?: string
  longitude?: number
  latitude?: number
  startTime?: string
  endTime?: string
  maxParticipants?: number
}

// 活动列表查询参数
export interface ActivityListParams {
  page?: number
  size?: number
  keyword?: string
  status?: ActivityStatus
}