import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthLayout.vue/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthLayout.vue/RegisterPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('@layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardLayout.vue/Router-View/DashboardPage.vue')
      },
      {
        path: '/wallet',
        name: 'wallet',
        component: () => import('@/views/DashboardLayout.vue/Router-View/WalletPage.vue')
      },
      {
        path: '/transfer',
        name: 'transfer',
        component: () => import('@/views/DashboardLayout.vue/Router-View/TransferPage.vue')
      },
      {
        path: '/merchants',
        name: 'merchants',
        component: () => import('@/views/DashboardLayout.vue/Router-View/MerchantsPage.vue')
      },
      {
        path: '/transactions',
        name: 'transactions',
        component: () => import('@/views/DashboardLayout.vue/Router-View/TransactionsPage.vue')
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/DashboardLayout.vue/Router-View/ProfilePage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]
const router