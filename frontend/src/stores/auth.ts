import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'
import { setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils/storage'
import type { User, LoginRequest, RegisterRequest, LoginResult } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  
  const isLoggedIn = computed(() => !!token.value)
  const nickname = computed(() => user.value?.nickname || user.value?.username || '游客')
  const avatar = computed(() => user.value?.avatar || '')
  
  // 登录
  async function login(data: LoginRequest) {
    const res = await request.post<LoginResult>('/api/auth/login', data)
    if (res.code === 200 && res.data) {
      token.value = res.data.token
      user.value = res.data.user as User
      setToken(res.data.token)
      setUserInfo(res.data.user)
    }
    return res
  }
  
  // 注册
  async function register(data: RegisterRequest) {
    const res = await request.post<LoginResult>('/api/auth/register', data)
    if (res.code === 200 && res.data) {
      token.value = res.data.token
      user.value = res.data.user as User
      setToken(res.data.token)
      setUserInfo(res.data.user)
    }
    return res
  }
  
  // 退出登录
  function logout() {
    token.value = null
    user.value = null
    removeToken()
    removeUserInfo()
  }
  
  // 初始化用户信息（从本地存储恢复）
  function init() {
    const storedToken = localStorage.getItem('travel_token')
    const storedUser = localStorage.getItem('travel_user')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser) as User
    }
  }
  
  return {
    token,
    user,
    isLoggedIn,
    nickname,
    avatar,
    login,
    register,
    logout,
    init
  }
})