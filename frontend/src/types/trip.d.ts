// 行程状态枚举
export enum TripStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

// 行程信息
export interface Trip {
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

// 路线规划结果
export interface RouteResult {
  distance: number
  duration: number
  originName: string
  destinationName: string
}