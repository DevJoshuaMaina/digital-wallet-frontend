<template>
  <header class="bg-white shadow-sm p-4 flex justify-between items-center">
    <h1 class="text-xl font-bold">Digital Wallet</h1>
    <BaseButton variant="secondary" @click="logout">Logout</BaseButton>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>