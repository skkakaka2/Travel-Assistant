import { request } from '@/utils/request'
import type { User, HomeLocation, HomeLocationRequest, UserVehicle } from '@/types/user'
import type { Result } from '@/types/api'

// 获取用户信息
export function getProfile(): Promise<Result<User>> {
  return request.get<User>('/api/user/profile')
}

// 更新用户信息
export function updateProfile(data: Partial<User>): Promise<Result<User>> {
  return request.put<User>('/api/user/profile', data)
}

// 更新头像
export function updateAvatar(avatar: string): Promise<Result<User>> {
  return request.put<User>('/api/user/avatar', { avatar })
}

// 获取家庭位置列表
export function getHomeLocations(): Promise<Result<HomeLocation[]>> {
  return request.get<HomeLocation[]>('/api/user/home-locations')
}

// 添加家庭位置
export function addHomeLocation(data: HomeLocationRequest): Promise<Result<HomeLocation>> {
  return request.post<HomeLocation>('/api/user/home-locations', data)
}

// 更新家庭位置
export function updateHomeLocation(id: number, data: HomeLocationRequest): Promise<Result<HomeLocation>> {
  return request.put<HomeLocation>(`/api/user/home-locations/${id}`, data)
}

// 删除家庭位置
export function deleteHomeLocation(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/user/home-locations/${id}`)
}

// 设置默认家庭位置
export function setDefaultHomeLocation(id: number): Promise<Result<void>> {
  return request.put<void>(`/api/user/home-locations/${id}/default`)
}

// 获取绑定车辆
export function getBoundVehicles(): Promise<Result<UserVehicle[]>> {
  return request.get<UserVehicle[]>('/api/vehicles/bound')
}

// 绑定车辆
export function bindVehicle(vehicleId: number): Promise<Result<void>> {
  return request.post<void>(`/api/user/vehicles/${vehicleId}`)
}

// 解绑车辆
export function unbindVehicle(vehicleId: number): Promise<Result<void>> {
  return request.delete<void>(`/api/user/vehicles/${vehicleId}`)
}

// 设置默认车辆
export function setDefaultVehicle(vehicleId: number): Promise<Result<void>> {
  return request.put<void>(`/api/user/vehicles/${vehicleId}/default`)
}