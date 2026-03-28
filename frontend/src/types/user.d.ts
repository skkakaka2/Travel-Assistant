// 用户信息
export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  status: number
  createdAt: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  phone?: string
}

// 登录结果
export interface LoginResult {
  token: string
  user: User
}

// 更新用户请求
export interface UpdateUserRequest {
  nickname?: string
  phone?: string
  email?: string
}

// 家庭位置
export interface HomeLocation {
  id: number
  name: string
  address: string
  longitude: number
  latitude: number
  isDefault: boolean
  createdAt: string
}

// 家庭位置请求
export interface HomeLocationRequest {
  name?: string
  address: string
  longitude?: number
  latitude?: number
  isDefault?: boolean
}

// 用户绑定车辆
export interface UserVehicle {
  bindId: number
  vehicleId: number
  model: string
  fuelConsumption: number
  isDefault: boolean
  bindTime: string
}