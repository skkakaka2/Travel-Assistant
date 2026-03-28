import { request } from '@/utils/request'
import type { Vehicle, VehicleRequest } from '@/types/vehicle'
import type { Result, PageResult, PageParams } from '@/types/api'

// 获取车辆列表
export function getVehicles(params?: PageParams): Promise<Result<PageResult<Vehicle>>> {
  return request.get<PageResult<Vehicle>>('/api/vehicles', params)
}

// 获取车辆详情
export function getVehicle(id: number): Promise<Result<Vehicle>> {
  return request.get<Vehicle>(`/api/vehicles/${id}`)
}

// 创建车辆
export function createVehicle(data: VehicleRequest): Promise<Result<Vehicle>> {
  return request.post<Vehicle>('/api/vehicles', data)
}

// 更新车辆
export function updateVehicle(id: number, data: VehicleRequest): Promise<Result<Vehicle>> {
  return request.put<Vehicle>(`/api/vehicles/${id}`, data)
}

// 删除车辆
export function deleteVehicle(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/vehicles/${id}`)
}

// 获取绑定车辆（用户视角）
export function getBoundVehicles(): Promise<Result<Vehicle[]>> {
  return request.get<Vehicle[]>('/api/vehicles/bound')
}