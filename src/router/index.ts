import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人中心' },
      },
      {
        path: 'home-locations',
        name: 'HomeLocations',
        component: () => import('@/views/user/HomeLocations.vue'),
        meta: { title: '家庭位置' },
      },
      {
        path: 'vehicles',
        name: 'Vehicles',
        component: () => import('@/views/user/Vehicles.vue'),
        meta: { title: '车辆管理' },
      },
      {
        path: 'trips',
        name: 'TripList',
        component: () => import('@/views/trip/TripList.vue'),
        meta: { title: '行程列表' },
      },
      {
        path: 'trips/create',
        name: 'TripCreate',
        component: () => import('@/views/trip/TripCreate.vue'),
        meta: { title: '创建行程' },
      },
      {
        path: 'trips/:id',
        name: 'TripDetail',
        component: () => import('@/views/trip/TripDetail.vue'),
        meta: { title: '行程详情' },
      },
      {
        path: 'expenses',
        name: 'ExpenseList',
        component: () => import('@/views/expense/ExpenseList.vue'),
        meta: { title: '费用列表' },
      },
      {
        path: 'expenses/statistics',
        name: 'ExpenseStatistics',
        component: () => import('@/views/expense/ExpenseStatistics.vue'),
        meta: { title: '费用统计' },
      },
      {
        path: 'activities',
        name: 'ActivityList',
        component: () => import('@/views/activity/ActivityList.vue'),
        meta: { title: '活动列表' },
      },
      {
        path: 'activities/my',
        name: 'MyActivities',
        component: () => import('@/views/activity/MyActivities.vue'),
        meta: { title: '我的活动' },
      },
      {
        path: 'activities/:id',
        name: 'ActivityDetail',
        component: () => import('@/views/activity/ActivityDetail.vue'),
        meta: { title: '活动详情' },
      },
      {
        path: 'messages',
        name: 'MessageList',
        component: () => import('@/views/message/MessageList.vue'),
        meta: { title: '消息中心' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '旅行助手'} - 旅行助手`

  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router