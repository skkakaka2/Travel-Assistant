// API 统一返回结果
export interface Result<T> {
  code: number
  message: string
  data: T
  total?: number
  page?: number
  size?: number
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 分页请求参数
export interface PageParams {
  page?: number
  size?: number
  [key: string]: number | undefined
}