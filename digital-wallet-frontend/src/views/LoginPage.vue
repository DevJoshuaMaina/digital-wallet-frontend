<template>
  <div class="min-h-screen flex items-center justify-center">
    <BaseCard class="w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin">
        <BaseInput v-model="credentials.username" label="Username or Email" placeholder="Enter username or email" :error="errors.username"/>
        <BaseInput v-model="credentials.pin" type="password" label="PIN" placeholder="Enter PIN" :error="errors.pin"/>
        <BaseButton type="submit" :loading="loading" class="w-full mt-4">Login</BaseButton>
      </form>
      <p class="text-center mt-4">
        Don't have an account? <router-link to="/register" class="text-primary-600">Register</router-link>
      </p>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import userApi from '@/services/userApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()

const credentials = ref({ username: '', pin: '' })
const errors = ref({})
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errors.value = {}
  try {
    const response = await userApi.login(credentials.value)
    userStore.setUser(response.user)
    router.push('/dashboard')
  } catch (error) {
    const err = handleApiError(error)
    errors.value = { general: err.message }
  } finally {
    loading.value = false
  }
}
</script>