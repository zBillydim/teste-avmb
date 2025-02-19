import { authGuard } from 'src/middleware/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Auth/AuthPage.vue') },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        beforeEnter: authGuard,
      },
      {
        path: 'access',
        component: () => import('pages/AccessPage.vue'),
        beforeEnter: authGuard,
      },
      {
        path: 'preapproval',
        component: () => import('pages/UserApprovalPage.vue'),
        beforeEnter: authGuard,
      },
      {
        path: 'listaccess',
        component: () => import('pages/AccessListPage.vue'),
        beforeEnter: authGuard,
      },
      {
        path: 'user-access',
        component: () => import('pages/UserAccessPage.vue'),
        beforeEnter: authGuard,
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
