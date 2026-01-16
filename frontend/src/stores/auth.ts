import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { User, LoginDto, RegisterDto } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(data: LoginDto) {
    const response = await authApi.login(data)
    // Token is stored in httpOnly cookie by backend
    // Also store token in localStorage for Authorization header
    if (response.data.code === 200 && response.data.data) {
      localStorage.setItem("token", response.data.data)
    }
    return response.data
  }

  async function register(data: RegisterDto) {
    const response = await authApi.register(data)
    return response.data
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    }
    // Clear token from localStorage
    localStorage.removeItem("token")
    user.value = null
  }

  function setUser(userData: User) {
    user.value = userData
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
  }
})

