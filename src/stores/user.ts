import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'
import type { UserVO, LoginRequest, RegisterRequest } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<UserVO | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(data: LoginRequest) {
    const res = await authApi.login(data)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function register(data: RegisterRequest) {
    const res = await authApi.register(data)
    return res
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await userApi.getProfile()
      user.value = res
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    fetchProfile,
    logout,
  }
})
