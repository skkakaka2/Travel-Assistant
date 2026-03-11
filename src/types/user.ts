// 用户信息
export interface UserVO {
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

// 登录响应
export interface LoginVO {
  token: string
  user: UserVO
}

// 更新用户信息请求
export interface UpdateUserRequest {
  nickname?: string
  phone?: string
  email?: string
}

// 家庭位置
export interface HomeLocationVO {
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

// 用户绑定的车辆
export interface UserVehicleVO {
  bindId: number
  vehicleId: number
  model: string
  fuelConsumption: number
  isDefault: boolean
  bindTime: string
}