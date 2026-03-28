import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const unreadMessageCount = ref(0)
  const loading = ref(false)
  
  // 暗色模式
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  
  function setUnreadCount(count: number) {
    unreadMessageCount.value = count
  }
  
  function setLoading(value: boolean) {
    loading.value = value
  }
  
  return {
    unreadMessageCount,
    loading,
    isDark,
    toggleDark,
    setUnreadCount,
    setLoading
  }
})