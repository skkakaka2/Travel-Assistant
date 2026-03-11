<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, useAppStore } from '@/stores'
import {
  Menu as IconMenu,
  Location,
  Car,
  Document,
  Money,
  Activity,
  Message,
  User,
  SwitchButton,
  Fold,
  Expand,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const menuItems = [
  { path: '/home', title: '首页', icon: IconMenu },
  { path: '/trips', title: '行程管理', icon: Location },
  { path: '/vehicles', title: '车辆管理', icon: Car },
  { path: '/expenses', title: '费用管理', icon: Money },
  { path: '/activities', title: '活动中心', icon: Activity },
  { path: '/messages', title: '消息中心', icon: Message },
  { path: '/profile', title: '个人中心', icon: User },
]

const activeMenu = computed(() => route.path)

const handleMenuSelect = (path: string) => {
  router.push(path)
  if (appStore.isMobile) {
    appStore.sidebarCollapsed = true
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleResize = () => {
  appStore.setMobile(window.innerWidth < 768)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  userStore.fetchProfile()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <el-container class="main-layout">
    <!-- 移动端遮罩 -->
    <div
      v-if="appStore.isMobile && !appStore.sidebarCollapsed"
      class="sidebar-mask"
      @click="appStore.sidebarCollapsed = true"
    />

    <!-- 侧边栏 -->
    <el-aside
      :width="appStore.sidebarCollapsed ? '64px' : '220px'"
      :class="['sidebar', { collapsed: appStore.sidebarCollapsed, mobile: appStore.isMobile }]"
    >
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo" class="logo-img" />
        <span v-show="!appStore.sidebarCollapsed" class="logo-text">旅行助手</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button
          v-if="!appStore.sidebarCollapsed"
          type="danger"
          text
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            text
            @click="appStore.toggleSidebar"
          >
            <el-icon :size="20">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar">
                {{ userStore.user?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username hide-sm">{{ userStore.user?.nickname || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.mobile {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;

    &.collapsed {
      transform: translateX(-100%);
    }
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #263445;

  .logo-img {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    margin-left: 12px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    white-space: nowrap;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;

  :deep(.el-menu-item) {
    color: #bfcbd9;

    &:hover {
      background-color: #263445;
    }

    &.is-active {
      color: #409eff;
      background-color: #263445;
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #263445;
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.main-container {
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .username {
    font-size: 14px;
    color: #606266;
  }
}

.main-content {
  background-color: #f2f3f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
}
</style>