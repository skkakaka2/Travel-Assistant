import { request } from '@/utils/request'
import type { Trip, CreateTripRequest } from '@/types/trip'
import type { RouteResult } from '@/types/map'
import type { Result, PageResult, PageParams } from '@/types/api'

// 获取行程列表
export function getTrips(params?: PageParams): Promise<Result<PageResult<Trip>>> {
  return request.get<PageResult<Trip>>('/api/trips', params)
}

// 获取行程详情
export function getTrip(id: number): Promise<Result<Trip>> {
  return request.get<Trip>(`/api/trips/${id}`)
}

// 创建行程
export function createTrip(data: CreateTripRequest): Promise<Result<Trip>> {
  return request.post<Trip>('/api/trips', data)
}

// 更新行程
export function updateTrip(id: number, data: CreateTripRequest): Promise<Result<Trip>> {
  return request.put<Trip>(`/api/trips/${id}`, data)
}

// 删除行程
export function deleteTrip(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/trips/${id}`)
}

// 开始行程
export function startTrip(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/trips/${id}/start`)
}

// 结束行程
export function endTrip(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/trips/${id}/end`)
}

// 取消行程
export function cancelTrip(id: number): Promise<Result<void>> {
  return request.post<void>(`/api/trips/${id}/cancel`)
}