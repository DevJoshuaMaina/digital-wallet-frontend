<template>
  <div class="min-h-screen flex items-center justify-center">
    <BaseCard class="w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
      <form @submit.prevent="handleLogin">
        <BaseInput v-model="credentials.username" label="Username or Email" placeholder="Enter username or email" :error="errors.username"/>
        <BaseInput v-model="credentials.pin" type="password" label="PIN" placeholder="Enter PIN" :error="errors.pin"/>
        <BaseButton type="submit" :loading="loading" class="w-full mt-4">Login</BaseButton>
      </form>
      <p class="text-center mt-4">Don't have an account? <router-link to="/register" class="text-primary-600">Register</router-link></p>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import userApi from '@/services/userApi'
import walletApi from '@/services/walletApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()

const credentials = ref({ username: '', pin: '' })
const errors = ref({})
const loading = ref(false)
const pinRegex = /^\d{4,6}$/

const validateLoginForm = () => {
  errors.value = {}
  credentials.value.username = credentials.value.username.trim()
  credentials.value.pin = credentials.value.pin.trim()

  if (!credentials.value.username) errors.value.username = 'Username or email is required'
  if (!pinRegex.test(credentials.value.pin)) errors.value.pin = 'PIN must be 4-6 digits'

  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateLoginForm()) return
  loading.value = true
  try {
    const response = await userApi.login(credentials.value)
    const token = response?.token || response?.data?.token
    const usernameFromResponse = response?.username || response?.data?.username || credentials.value.username
    const idFromResponse = response?.id || response?.userId || response?.data?.id || response?.data?.userId
    if (token) {
      userStore.setToken(token)
    }

    let user = response?.user || response?.data?.user
    if (!user && idFromResponse) {
      try {
        const userProfileById = await userApi.getUserByID(idFromResponse)
        user = userProfileById?.data || userProfileById?.user || userProfileById
      }
      catch {
        // Try username lookup fallback below.
      }
    }

    if (!user && usernameFromResponse) {
      try {
        const userProfile = await userApi.getUserByUsername(usernameFromResponse)
        user = userProfile?.data || userProfile?.user || userProfile
      }
      catch {
        // Keep fallback user below when profile lookup is unavailable.
      }
    }

    const resolvedWallet = await walletApi.resolveWallet(user)

    if (!user) {
      user = {
        id: idFromResponse || null,
        username: usernameFromResponse,
        fullName: usernameFromResponse
      }
    }
    else {
      user.id = user.id ?? user.userId ?? idFromResponse ?? null
      user.username = user.username || user.userName || usernameFromResponse
      user.fullName = user.fullName || user.displayName || user.name || user.username || usernameFromResponse
    }

    user.wallet = resolvedWallet || user.wallet || { balance: 0, walletNumber: 'N/A' }

    userStore.setUser(user)
    toastStore.success('Welcome back! Login successful.')
    router.push('/dashboard')
  } 
  catch (error) {
    const err = handleApiError(error)
    toastStore.error(err.message)
    errors.value = {
      ...errors.value,
      ...err.fieldErrors,
      general: err.message
    }
  } 
  finally {
    loading.value = false
  }
}
</script>
