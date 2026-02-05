<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Wallet Management</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BalanceCard :wallet="userStore.wallet" />
      <AddMoneyForm @success="updateWallet" />
    </div>
    <LimitSettings :wallet="userStore.wallet" @update="updateWallet" />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import BalanceCard from '@/components/BalanceCard.vue'
import AddMoneyForm from '@/components/AddMoneyForm.vue'
import LimitSettings from '@/components/LimitSettings.vue'

const userStore = useUserStore()

const updateWallet = () => {
  // Refresh wallet data
  userStore.setWallet(userStore.wallet)
}
</script>