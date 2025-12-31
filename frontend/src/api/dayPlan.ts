import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse, DayPlan, CreateDayPlanDto, UpdateDayPlanDto, DayPlanItem } from '@/types/api'

export const dayPlanApi = {
  getAll(params?: PaginationQuery) {
    return request.get<ApiResponse<PaginationResponse<DayPlan>>>('/dayplan', { params })
  },

  getById(id: number) {
    return request.get<ApiResponse<DayPlan>>(`/dayplan/${id}`)
  },

  getItems(id: number) {
    return request.get<ApiResponse<DayPlanItem[]>>(`/dayplan/${id}/items`)
  },

  create(data: CreateDayPlanDto) {
    return request.post<ApiResponse<DayPlan>>('/dayplan', data)
  },

  update(id: number, data: UpdateDayPlanDto) {
    return request.patch<ApiResponse<DayPlan>>(`/dayplan/${id}`, data)
  },

  delete(id: number) {
    return request.delete<ApiResponse<DayPlan>>(`/dayplan/${id}`)
  },
}

