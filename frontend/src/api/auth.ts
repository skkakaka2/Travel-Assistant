import request from '@/utils/request'
import type { ApiResponse, LoginDto, RegisterDto, User } from '@/types/api'

export const authApi = {
  login(data: LoginDto) {
    return request.post<ApiResponse<string>>('/auth/login', data)
  },

  register(data: RegisterDto) {
    return request.post<ApiResponse<User>>('/auth/register', data)
  },

  logout() {
    return request.post<ApiResponse<null>>('/auth/logout')
  },
}

