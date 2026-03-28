import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'
import type { User, UpdateUserRequest, HomeLocation, HomeLocationRequest, UserVehicle } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null)
  const homeLocations = ref<HomeLocation[]>([])
  const boundVehicles = ref<UserVehicle[]>([])
  
  // 获取用户信息
  async function getProfile() {
    const res = await request.get<User>('/api/user/profile')
    if (res.code === 200 && res.data) {
      profile.value = res.data
    }
    return res
  }
  
  // 更新用户信息
  async function updateProfile(data: UpdateUserRequest) {
    const res = await request.put<User>('/api/user/profile', data)
    if (res.code === 200 && res.data) {
      profile.value = res.data
    }
    return res
  }
  
  // 更新头像
  async function updateAvatar(avatar: string) {
    const res = await request.put<User>('/api/user/avatar', { avatar })
    if (res.code === 200 && res.data) {
      profile.value = res.data
    }
    return res
  }
  
  // 获取家庭位置列表
  async function getHomeLocations() {
    const res = await request.get<HomeLocation[]>('/api/user/home-locations')
    if (res.code === 200 && res.data) {
      homeLocations.value = res.data
    }
    return res
  }
  
  // 添加家庭位置
  async function addHomeLocation(data: HomeLocationRequest) {
    const res = await request.post<HomeLocation>('/api/user/home-locations', data)
    if (res.code === 200) {
      await getHomeLocations()
    }
    return res
  }
  
  // 更新家庭位置
  async function updateHomeLocation(id: number, data: HomeLocationRequest) {
    const res = await request.put<HomeLocation>(`/api/user/home-locations/${id}`, data)
    if (res.code === 200) {
      await getHomeLocations()
    }
    return res
  }
  
  // 删除家庭位置
  async function deleteHomeLocation(id: number) {
    const res = await request.delete<void>(`/api/user/home-locations/${id}`)
    if (res.code === 200) {
      await getHomeLocations()
    }
    return res
  }
  
  // 设置默认家庭位置
  async function setDefaultHomeLocation(id: number) {
    const res = await request.put<void>(`/api/user/home-locations/${id}/default`)
    if (res.code === 200) {
      await getHomeLocations()
    }
    return res
  }
  
  // 获取绑定车辆
  async function getBoundVehicles() {
    const res = await request.get<UserVehicle[]>('/api/vehicles/bound')
    if (res.code === 200 && res.data) {
      boundVehicles.value = res.data
    }
    return res
  }
  
  // 绑定车辆
  async function bindVehicle(vehicleId: number) {
    const res = await request.post<void>(`/api/user/vehicles/${vehicleId}`)
    if (res.code === 200) {
      await getBoundVehicles()
    }
    return res
  }
  
  // 解绑车辆
  async function unbindVehicle(vehicleId: number) {
    const res = await request.delete<void>(`/api/user/vehicles/${vehicleId}`)
    if (res.code === 200) {
      await getBoundVehicles()
    }
    return res
  }
  
  // 设置默认车辆
  async function setDefaultVehicle(vehicleId: number) {
    const res = await request.put<void>(`/api/user/vehicles/${vehicleId}/default`)
    if (res.code === 200) {
      await getBoundVehicles()
    }
    return res
  }
  
  return {
    profile,
    homeLocations,
    boundVehicles,
    getProfile,
    updateProfile,
    updateAvatar,
    getHomeLocations,
    addHomeLocation,
    updateHomeLocation,
    deleteHomeLocation,
    setDefaultHomeLocation,
    getBoundVehicles,
    bindVehicle,
    unbindVehicle,
    setDefaultVehicle
  }
})