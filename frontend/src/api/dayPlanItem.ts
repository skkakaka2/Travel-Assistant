import request from '@/utils/request'
import type { ApiResponse, DayPlanItem, CreateDayPlanItemDto, UpdateDayPlanItemDto } from '@/types/api'

export const dayPlanItemApi = {
  getAll() {
    return request.get<ApiResponse<DayPlanItem[]>>('/day-plan-item')
  },

  getById(id: number) {
    return request.get<ApiResponse<DayPlanItem>>(`/day-plan-item/${id}`)
  },

  create(data: CreateDayPlanItemDto) {
    return request.post<ApiResponse<DayPlanItem>>('/day-plan-item', data)
  },

  update(id: number, data: UpdateDayPlanItemDto) {
    return request.patch<ApiResponse<DayPlanItem>>(`/day-plan-item/${id}`, data)
  },

  delete(id: number) {
    return request.delete<ApiResponse<DayPlanItem>>(`/day-plan-item/${id}`)
  },
}

