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
      <BaseCard title="Recent Transactions">
        <TransactionItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          @click="viewTransaction"
        />
        <router-link to="/transactions" class="text-primary-600 mt-4 block">View All</router-link>
      </BaseCard>
      <BaseCard title="Transaction Stats">
        <StatsCard label="Total Sent" :value="'₦' + stats.sent" icon="📤" color="red" />
        <StatsCard label="Total Received" :value="'₦' + stats.received" icon="📥" color="green" />
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTransactionStore } from '@/stores/transaction'
import transactionApi from '@/services/transactionApi'
import WalletCard from '@/components/WalletCard.vue'
import QuickActionButton from '@/components/QuickActionButton.vue'
import TransactionItem from '@/components/TransactionItem.vue'
import StatsCard from '@/components/StatsCard.vue'
import BaseCard from '@/components/base/BaseCard.vue'

const router = useRouter()
const userStore = useUserStore()
const transactionStore = useTransactionStore()

const recentTransactions = ref([])
const stats = ref({ sent: 0, received: 0 })

onMounted(async () => {
  try {
    const transactions = await transactionApi.getTransactions(userStore.currentUser.id, { limit: 5 })
    recentTransactions.value = transactions
    const statsData = await transactionApi.getTransactionStats(userStore.currentUser.id)
    stats.value = statsData
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})

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

const viewTransaction = (transaction) => {
  // Placeholder for transaction details modal
}
</script>