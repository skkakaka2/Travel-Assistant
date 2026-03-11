import { request } from '@/utils/request'
import type { ActivityVO, ActivityRequest, PageData, ActivityListParams } from '@/types'

export const activityApi = {
  // 获取活动列表
  getList(params: ActivityListParams) {
    return request.get<PageData<ActivityVO>>('/activities', { params })
  },

  // 获取活动详情
  get(id: number) {
    return request.get<ActivityVO>(`/activities/${id}`)
  },

  // 创建活动
  create(data: ActivityRequest) {
    return request.post<ActivityVO>('/activities', data)
  },

  // 更新活动
  update(id: number, data: ActivityRequest) {
    return request.put<ActivityVO>(`/activities/${id}`, data)
  },

  // 删除活动
  delete(id: number) {
    return request.delete<void>(`/activities/${id}`)
  },

  // 参加活动
  join(id: number) {
    return request.post<ActivityVO>(`/activities/${id}/join`)
  },

  // 退出活动
  quit(id: number) {
    return request.post<ActivityVO>(`/activities/${id}/quit`)
  },

  // 取消活动
  cancel(id: number) {
    return request.post<void>(`/activities/${id}/cancel`)
  },

  // 获取我参与的活动
  getMyJoined() {
    return request.get<ActivityVO[]>('/activities/my/joined')
  },

  // 获取我创建的活动
  getMyCreated() {
    return request.get<ActivityVO[]>('/activities/my/created')
  },
}