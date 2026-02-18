import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LandingPage from '@/views/LandingPage.vue'
import LoginPage from '@/views/AuthLayout.vue/LoginPage.vue'
import RegisterPage from '@/views/AuthLayout.vue/RegisterPage.vue'

const routes = [ 
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardPage.vue')
      },
      {
        path: '/wallet',
        name: 'wallet',
        component: () => import('@/views/WalletPage.vue')
      },
      {
        path: '/transfer',
        name: 'transfer',
        component: () => import('@/views/TransferPage.vue')
      },
      {
        path: '/merchants',
        name: 'merchants',
        component: () => import('@/views/MerchantsPage.vue')
      },
      {
        path: '/transactions',
        name: 'transactions',
        component: () => import('@/views/TransactionsPage.vue')
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/ProfilePage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && userStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
