import { request } from '@/utils/request'
import type { LoginRequest, RegisterRequest, LoginResult, User } from '@/types/user'
import type { Result } from '@/types/api'

// 登录
export function login(data: LoginRequest): Promise<Result<LoginResult>> {
  return request.post<LoginResult>('/api/auth/login', data)
}

// 注册
export function register(data: RegisterRequest): Promise<Result<LoginResult>> {
  return request.post<LoginResult>('/api/auth/register', data)
}

// 获取当前用户信息
export function getProfile(): Promise<Result<User>> {
  return request.get<User>('/api/user/profile')
}

// 更新用户信息
export function updateProfile(data: Partial<User>): Promise<Result<User>> {
  return request.put<User>('/api/user/profile', data)
}

// 更新头像
export function updateAvatar(avatar: string): Promise<Result<User>> {
  return request.put<User>('/api/user/avatar', { avatar })
}