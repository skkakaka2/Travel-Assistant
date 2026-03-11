import { request } from '@/utils/request'
import type {
  UserVO,
  UpdateUserRequest,
  HomeLocationVO,
  HomeLocationRequest,
  UserVehicleVO,
} from '@/types'

export const userApi = {
  // 获取当前用户信息
  getProfile() {
    return request.get<UserVO>('/user/profile')
  },

  // 更新用户信息
  updateProfile(data: UpdateUserRequest) {
    return request.put<UserVO>('/user/profile', data)
  },

  // 更新头像
  updateAvatar(avatarUrl: string) {
    return request.put<void>('/user/avatar', null, { params: { avatarUrl } })
  },

  // 获取家庭位置列表
  getHomeLocations() {
    return request.get<HomeLocationVO[]>('/user/home-locations')
  },

  // 添加家庭位置
  addHomeLocation(data: HomeLocationRequest) {
    return request.post<HomeLocationVO>('/user/home-locations', data)
  },

  // 更新家庭位置
  updateHomeLocation(id: number, data: HomeLocationRequest) {
    return request.put<HomeLocationVO>(`/user/home-locations/${id}`, data)
  },

  // 删除家庭位置
  deleteHomeLocation(id: number) {
    return request.delete<void>(`/user/home-locations/${id}`)
  },

  // 设置默认家庭位置
  setDefaultHomeLocation(id: number) {
    return request.put<void>(`/user/home-locations/${id}/default`)
  },

  // 获取绑定车辆
  getVehicles() {
    return request.get<UserVehicleVO[]>('/vehicles/bound')
  },

  // 绑定车辆
  bindVehicle(vehicleId: number) {
    return request.post<void>(`/user/vehicles/${vehicleId}`)
  },

  // 解绑车辆
  unbindVehicle(vehicleId: number) {
    return request.delete<void>(`/user/vehicles/${vehicleId}`)
  },

  // 设置默认车辆
  setDefaultVehicle(vehicleId: number) {
    return request.put<void>(`/user/vehicles/${vehicleId}/default`)
  },
}