<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUnreadCount } from '@/api/message'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// 导航菜单
const navItems = [
  { path: '/', label: '首页', icon: 'HomeFilled' },
  { path: '/trips', label: '行程', icon: 'Location' },
  { path: '/activities', label: '活动', icon: 'Calendar' },
  { path: '/expenses', label: '费用', icon: 'Wallet' },
  { path: '/vehicles', label: '车辆', icon: 'Truck' }
]

const activeNav = computed(() => {
  const path = route.path
  // 匹配导航项
  for (const item of navItems) {
    if (path === item.path || path.startsWith(item.path + '/')) {
      return item.path
    }
  }
  return '/'
})

// 获取未读消息数量
async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    if (res.code === 200 && res.data) {
      appStore.setUnreadCount(res.data)
    }
  } catch {
    // 忽略错误
  }
}

// 初始化
if (authStore.isLoggedIn) {
  fetchUnreadCount()
}

// 退出登录
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {
    // 取消
  })
}

// 切换主题
function toggleTheme() {
  appStore.toggleDark()
}

// 用户下拉菜单
const userMenuItems = [
  { label: '个人信息', path: '/profile', icon: 'User' },
  { label: '家庭位置', path: '/home-locations', icon: 'House' },
  { label: '车辆绑定', path: '/my-vehicles', icon: 'Connection' },
  { label: '消息', path: '/messages', icon: 'Message' }
]

function handleUserMenuSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <span class="logo-icon">🧭</span>
        <span class="logo-text">旅行助手</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: activeNav === item.path }]"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <!-- 主题切换 -->
        <el-button class="theme-btn" circle @click="toggleTheme">
          <el-icon v-if="appStore.isDark"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </el-button>

        <!-- 消息 -->
        <el-badge
          v-if="authStore.isLoggedIn"
          :value="appStore.unreadMessageCount"
          :hidden="appStore.unreadMessageCount === 0"
          class="message-badge"
        >
          <el-button circle @click="router.push('/messages')">
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>

        <!-- 用户信息 -->
        <el-dropdown v-if="authStore.isLoggedIn" trigger="click" @command="handleUserMenuSelect">
          <div class="user-info">
            <el-avatar
              :size="32"
              :src="authStore.avatar"
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="user-name">{{ authStore.nickname }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in userMenuItems"
                :key="item.path"
                :command="item.path"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                {{ item.label }}
              </el-dropdown-item>
              <el-dropdown-item divided command="logout" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 未登录状态 -->
        <div v-if="!authStore.isLoggedIn" class="auth-buttons">
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
          <el-button @click="router.push('/register')">注册</el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(90deg, #FF6B35 0%, #FFD166 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .logo-icon {
    font-size: 28px;
    margin-right: 8px;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: bold;
    color: white;
  }
}

.nav-menu {
  display: flex;
  gap: 8px;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    color: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    transition: all 0.2s;
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.2);
    }
    
    &.active {
      color: white;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .theme-btn, .message-badge .el-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  .user-avatar {
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  
  .user-name {
    color: white;
    font-size: 14px;
  }
}

.auth-buttons {
  display: flex;
  gap: 8px;
  
  .el-button {
    border-radius: 16px;
  }
  
  .el-button--primary {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .user-name {
    display: none;
  }
}
</style>