import { request } from '@/utils/request'
import type { LoginRequest, LoginVO, RegisterRequest, UserVO } from '@/types'

export const authApi = {
  login(data: LoginRequest) {
    return request.post<LoginVO>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return request.post<UserVO>('/auth/register', data)
  },
}