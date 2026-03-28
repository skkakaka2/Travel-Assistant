import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { title: '个人信息', requiresAuth: true }
  },
  {
    path: '/home-locations',
    name: 'HomeLocations',
    component: () => import('@/views/user/HomeLocations.vue'),
    meta: { title: '家庭位置', requiresAuth: true }
  },
  {
    path: '/my-vehicles',
    name: 'MyVehicles',
    component: () => import('@/views/user/Vehicles.vue'),
    meta: { title: '车辆绑定', requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'VehicleList',
    component: () => import('@/views/vehicle/VehicleList.vue'),
    meta: { title: '车辆管理', requiresAuth: true }
  },
  {
    path: '/vehicles/create',
    name: 'VehicleCreate',
    component: () => import('@/views/vehicle/VehicleForm.vue'),
    meta: { title: '新建车辆', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/edit',
    name: 'VehicleEdit',
    component: () => import('@/views/vehicle/VehicleForm.vue'),
    meta: { title: '编辑车辆', requiresAuth: true }
  },
  {
    path: '/trips',
    name: 'TripList',
    component: () => import('@/views/trip/TripList.vue'),
    meta: { title: '行程列表', requiresAuth: true }
  },
  {
    path: '/trips/create',
    name: 'TripCreate',
    component: () => import('@/views/trip/TripForm.vue'),
    meta: { title: '新建行程', requiresAuth: true }
  },
  {
    path: '/trips/:id',
    name: 'TripDetail',
    component: () => import('@/views/trip/TripDetail.vue'),
    meta: { title: '行程详情', requiresAuth: true }
  },
  {
    path: '/trips/:id/edit',
    name: 'TripEdit',
    component: () => import('@/views/trip/TripForm.vue'),
    meta: { title: '编辑行程', requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'ActivityList',
    component: () => import('@/views/activity/ActivityList.vue'),
    meta: { title: '活动列表', requiresAuth: true }
  },
  {
    path: '/activities/create',
    name: 'ActivityCreate',
    component: () => import('@/views/activity/ActivityForm.vue'),
    meta: { title: '创建活动', requiresAuth: true }
  },
  {
    path: '/activities/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/ActivityDetail.vue'),
    meta: { title: '活动详情', requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'ExpenseList',
    component: () => import('@/views/expense/ExpenseList.vue'),
    meta: { title: '费用列表', requiresAuth: true }
  },
  {
    path: '/expenses/create',
    name: 'ExpenseCreate',
    component: () => import('@/views/expense/ExpenseForm.vue'),
    meta: { title: '新建费用', requiresAuth: true }
  },
  {
    path: '/expenses/:id/edit',
    name: 'ExpenseEdit',
    component: () => import('@/views/expense/ExpenseForm.vue'),
    meta: { title: '编辑费用', requiresAuth: true }
  },
  {
    path: '/expenses/statistics',
    name: 'ExpenseStats',
    component: () => import('@/views/expense/ExpenseStats.vue'),
    meta: { title: '费用统计', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'MessageList',
    component: () => import('@/views/message/MessageList.vue'),
    meta: { title: '消息列表', requiresAuth: true }
  },
  {
    path: '/messages/:id',
    name: 'MessageDetail',
    component: () => import('@/views/message/MessageDetail.vue'),
    meta: { title: '消息详情', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '旅行助手'} - 旅行助手`
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = getToken()
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 已登录时不允许访问登录/注册页
  if (to.path === '/login' || to.path === '/register') {
    const token = getToken()
    if (token) {
      next('/')
      return
    }
  }
  
  next()
})

export default router