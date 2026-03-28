// 车辆信息
export interface Vehicle {
  id: number
  model: string
  fuelConsumption: number
  createdAt: string
}

// 车辆请求
export interface VehicleRequest {
  model: string
  fuelConsumption?: number
}