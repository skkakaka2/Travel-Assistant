// 行程状态枚举
export enum TripStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// 行程信息
export interface TripVO {
  id: number
  title: string
  vehicleId: number
  vehicleModel: string
  startLocation: string
  startLongitude: number
  startLatitude: number
  endLocation: string
  endLongitude: number
  endLatitude: number
  distance: number
  duration: number
  status: TripStatus
  statusDesc: string
  startTime: string
  endTime: string
  createdAt: string
}

// 创建行程请求
export interface CreateTripRequest {
  title?: string
  vehicleId?: number
  startLocation: string
  startLongitude?: number
  startLatitude?: number
  endLocation: string
  endLongitude?: number
  endLatitude?: number
}

// 行程列表查询参数
export interface TripListParams {
  page?: number
  size?: number
  status?: TripStatus
}