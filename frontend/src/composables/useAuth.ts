import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)
  const nickname = computed(() => authStore.nickname)
  const avatar = computed(() => authStore.avatar)
  
  async function login(username: string, password: string) {
    return authStore.login({ username, password })
  }
  
  async function register(username: string, password: string, nickname?: string) {
    return authStore.register({ username, password, nickname })
  }
  
  function logout() {
    authStore.logout()
  }
  
  return {
    isLoggedIn,
    user,
    nickname,
    avatar,
    login,
    register,
    logout
  }
}