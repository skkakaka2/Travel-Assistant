import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/trips',
  },
  // Auth layout routes
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/login/index.vue'),
        meta: { public: true, title: '登录' },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/register/index.vue'),
        meta: { public: true, title: '注册' },
      },
    ],
  },
  // Default layout routes
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'trips',
        name: 'Trips',
        component: () => import('@/pages/trips/index.vue'),
        meta: { title: '我的行程' },
      },
      {
        path: 'trips/:id',
        name: 'TripDetail',
        component: () => import('@/pages/trips/[id]/index.vue'),
        meta: { title: '行程详情' },
      },
      {
        path: 'trips/:id/day/:dayId',
        name: 'DayPlanDetail',
        component: () => import('@/pages/trips/[id]/day/[dayId].vue'),
        meta: { title: '日期计划' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/index.vue'),
        meta: { title: '设置' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/trips',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  // Update document title
  const title = to.meta.title as string
  document.title = title ? `${title} - 旅行助手` : '旅行助手'

  // Check authentication (skip for public routes)
  // Note: In a real app, you would check the auth state here
  // For now, we allow all routes since auth is cookie-based
  next()
})

export default router
