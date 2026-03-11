// 统一响应结构
export interface Result<T = void> {
  code: number
  message: string
  data: T
  total?: number
  page?: number
  size?: number
}

// 分页请求参数
export interface PageParams {
  page?: number
  size?: number
}

// 分页响应数据
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}