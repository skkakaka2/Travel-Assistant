import { request } from '@/utils/request'
import type { TripVO, CreateTripRequest, PageData, TripListParams } from '@/types'

export const tripApi = {
  // 获取行程列表
  getList(params: TripListParams) {
    return request.get<PageData<TripVO>>('/trips', { params })
  },

  // 获取行程详情
  get(id: number) {
    return request.get<TripVO>(`/trips/${id}`)
  },

  // 创建行程
  create(data: CreateTripRequest) {
    return request.post<TripVO>('/trips', data)
  },

  // 更新行程
  update(id: number, data: CreateTripRequest) {
    return request.put<TripVO>(`/trips/${id}`, data)
  },

  // 删除行程
  delete(id: number) {
    return request.delete<void>(`/trips/${id}`)
  },

  // 开始行程
  start(id: number) {
    return request.post<TripVO>(`/trips/${id}/start`)
  },

  // 结束行程
  end(id: number) {
    return request.post<TripVO>(`/trips/${id}/end`)
  },

  // 取消行程
  cancel(id: number) {
    return request.post<void>(`/trips/${id}/cancel`)
  },
}