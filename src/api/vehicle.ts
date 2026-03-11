import { request } from '@/utils/request'
import type { VehicleVO, VehicleRequest, PageData, PageParams } from '@/types'

export const vehicleApi = {
  // 获取车辆列表
  getList(params: PageParams & { model?: string }) {
    return request.get<PageData<VehicleVO>>('/vehicles', { params })
  },

  // 获取车辆详情
  get(id: number) {
    return request.get<VehicleVO>(`/vehicles/${id}`)
  },

  // 创建车辆
  create(data: VehicleRequest) {
    return request.post<VehicleVO>('/vehicles', data)
  },

  // 更新车辆
  update(id: number, data: VehicleRequest) {
    return request.put<VehicleVO>(`/vehicles/${id}`, data)
  },

  // 删除车辆
  delete(id: number) {
    return request.delete<void>(`/vehicles/${id}`)
  },
}