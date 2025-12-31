import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse, Trip, CreateTripDto, UpdateTripDto } from '@/types/api'

export const tripApi = {
  getAll(params?: PaginationQuery) {
    return request.get<ApiResponse<PaginationResponse<Trip>>>('/trip', { params })
  },

  getById(id: number) {
    return request.get<ApiResponse<Trip>>(`/trip/${id}`)
  },

  create(data: CreateTripDto) {
    return request.post<ApiResponse<Trip>>('/trip', data)
  },

  update(id: number, data: UpdateTripDto) {
    return request.patch<ApiResponse<Trip>>(`/trip/${id}`, data)
  },

  delete(id: number) {
    return request.delete<ApiResponse<Trip>>(`/trip/${id}`)
  },
}

