// 活动状态枚举
export enum ActivityStatus {
  ACTIVE = 0,
  CANCELLED = 1,
  COMPLETED = 2
}

// 活动信息
export interface Activity {
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