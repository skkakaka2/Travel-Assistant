const TOKEN_KEY = 'travel_token'
const USER_KEY = 'travel_user'
const THEME_KEY = 'travel_theme'

// Token 操作
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息操作
export function getUserInfo(): unknown {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function setUserInfo(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeUserInfo(): void {
  localStorage.removeItem(USER_KEY)
}

// 主题操作
export function getTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem(THEME_KEY)
  if (theme === 'dark' || theme === 'light') {
    return theme
  }
  // 跟随系统
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme)
}

// 清除所有登录状态
export function clearAuth(): void {
  removeToken()
  removeUserInfo()
}