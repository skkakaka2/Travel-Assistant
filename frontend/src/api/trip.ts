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

  /**
   * 导出行程为 PDF
   * @param id 行程 ID
   * @param filename 文件名（可选）
   */
  async exportToPDF(id: number, filename?: string) {
    const response = await request.get(`/trip/${id}/export/pdf`, {
      responseType: 'blob',
    })
    
    // response.data 已经是 Blob 对象
    const blob = response.data as Blob
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || `trip-${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return response
  },

  /**
   * 导出行程为图片 (PNG)
   * @param id 行程 ID
   * @param filename 文件名（可选）
   */
  async exportToImage(id: number, filename?: string) {
    const response = await request.get(`/trip/${id}/export/image`, {
      responseType: 'blob',
    })
    
    // response.data 已经是 Blob 对象
    const blob = response.data as Blob
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || `trip-${id}.png`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return response
  },
}

