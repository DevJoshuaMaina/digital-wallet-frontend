<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Welcome back, {{ userStore.userName }}</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <WalletCard :wallet="userStore.wallet" @add-money="showAddMoney" @transfer="goToTransfer" />
      <div class="grid grid-cols-2 gap-4">
        <QuickActionButton icon="💰" label="Add Money" color="green" @click="showAddMoney" />
        <QuickActionButton icon="📤" label="Send Money" color="blue" @click="goToTransfer" />
        <QuickActionButton icon="🏪" label="Pay Merchant" color="purple" @click="goToMerchants" />
        <QuickActionButton icon="📥" label="Request Money" color="orange" @click="goToRequest" />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentTransactions />
      <StatsChart />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import WalletCard from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/WalletCard.vue'
import QuickActionButton from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/QuickActions.vue'
import RecentTransactions from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/RecentTransactions.vue'
import StatsChart from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/StatsChart.vue'

const router = useRouter()
const userStore = useUserStore()

const showAddMoney = () => {
  router.push('/wallet')
}

const goToTransfer = () => {
  router.push('/transfer')
}

const goToMerchants = () => {
  router.push('/merchants')
}

const goToRequest = () => {
  // Placeholder for request money feature
}
</script>
