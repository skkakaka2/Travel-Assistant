import { request } from '@/utils/request'

export const fileApi = {
  // 上传文件
  upload(file: File, directory = 'files') {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string }>('/files/upload', formData, {
      params: { directory },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 上传头像
  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string }>('/files/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}