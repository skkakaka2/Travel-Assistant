import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './storage'
import router from '@/router'
import type { Result } from '@/types/api'

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<Result<unknown>>) => {
    const { data } = response
    if (data.code === 200) {
      return response
    }
    // 业务错误
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          removeToken()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络异常，请检查网络连接')
    } else {
      ElMessage.error(error.message)
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<Result<T>> {
    return instance.get(url, { params, ...config }).then(res => res.data)
  },
  
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Result<T>> {
    return instance.post(url, data, config).then(res => res.data)
  },
  
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Result<T>> {
    return instance.put(url, data, config).then(res => res.data)
  },
  
  delete<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<Result<T>> {
    return instance.delete(url, { params, ...config }).then(res => res.data)
  }
}

export default instance