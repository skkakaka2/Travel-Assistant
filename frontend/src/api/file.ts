import { request } from '@/utils/request'
import type { Result } from '@/types/api'

interface UploadResult {
  url: string
  filename: string
}

// 上传文件
export function uploadFile(file: File): Promise<Result<UploadResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<UploadResult>('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 上传头像
export function uploadAvatar(file: File): Promise<Result<UploadResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<UploadResult>('/api/files/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}