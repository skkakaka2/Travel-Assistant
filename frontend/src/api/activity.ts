import { request } from '@/utils/request'
import type { Activity, ActivityRequest } from '@/types/activity'
import type { Result, PageResult, PageParams } from '@/types/api'

// 获取活动列表
export function getActivities(params?: PageParams): Promise<Result<PageResult<Activity>>> {
  return request.get<PageResult<Activity>>('/api/activities', params)
}

// 获取活动详情
export function getActivity(id: number): Promise<Result<Activity>> {
  return request.get<Activity>(`/api/activities/${id}`)
}

// 创建活动
export function createActivity(data: ActivityRequest): Promise<Result<Activity>> {
  return request.post<Activity>('/api/activities', data)
}

// 更新活动
export function updateActivity(id: number, data: ActivityRequest): Promise<Result<Activity>> {
  return request.put<Activity>(`/api/activities/${id}`, data)
}

// 删除活动
export function deleteActivity(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/activities/${id}`)
}

// 参加活动
export function joinActivity(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/activities/${id}/join`)
}

// 退出活动
export function quitActivity(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/activities/${id}/quit`)
}

// 取消活动
export function cancelActivity(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/activities/${id}/cancel`)
}

// 获取我参与的活动
export function getMyJoinedActivities(): Promise<Result<Activity[]>> {
  return request.get<Activity[]>('/api/activities/my/joined')
}

// 获取我创建的活动
export function getMyCreatedActivities(): Promise<Result<Activity[]>> {
  return request.get<Activity[]>('/api/activities/my/created')
}