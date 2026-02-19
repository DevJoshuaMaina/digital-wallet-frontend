<template>
  <header class="bg-white shadow-sm p-4 flex justify-between items-center">
    <h1 class="text-xl font-bold">Digital Wallet</h1>
    <BaseButton variant="secondary" @click="logout">Logout</BaseButton>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTransactionStore } from '@/stores/transaction'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const transactionStore = useTransactionStore()

const logout = () => {
  transactionStore.resetState()
  userStore.logout()
  router.push('/login')
}
</script>
