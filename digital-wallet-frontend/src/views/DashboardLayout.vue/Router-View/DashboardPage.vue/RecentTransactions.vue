<template>
  <BaseCard title="Recent Transactions">
    <div v-if="transactionStore.loading" class="text-center py-4">
      <BaseLoader />
    </div>
    <BaseAlert v-else-if="transactionStore.error" type="error" :message="transactionStore.error" />
    <div v-else-if="recentTransactions.length">
      <TransactionItem
        v-for="transaction in recentTransactions"
        :key="transaction.id"
        :transaction="transaction"
        @click="viewTransaction"
      />
      <router-link to="/transactions" class="text-primary-600 mt-4 block text-center">View All</router-link>
    </div>
    <EmptyState v-else message="No recent transactions" icon="H" />
  </BaseCard>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useTransactionStore } from '@/stores/transaction'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import TransactionItem from '@/views/DashboardLayout.vue/Router-View/TransactionsPage.vue/TransactionItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const transactionStore = useTransactionStore()

const recentTransactions = computed(() => transactionStore.transactions.slice(0, 5))
const getCurrentUserIdentifier = () =>
  userStore.currentUser?.id ||
  userStore.currentUser?.userId ||
  userStore.currentUser?.user?.id ||
  userStore.currentUser?.username ||
  userStore.currentUser?.userName ||
  userStore.wallet?.id ||
  userStore.currentUser?.wallet?.id ||
  null

const fetchRecentTransactions = async () => {
  const identifier = getCurrentUserIdentifier()
  if (!identifier) return
  await transactionStore.fetchTransactions(identifier, {
    page: 0,
    size: 10,
    username: userStore.currentUser?.username || userStore.currentUser?.userName,
    walletId: userStore.currentUser?.wallet?.id || userStore.wallet?.id,
  })
}

watch(
  () =>
    [
      userStore.currentUser?.id,
      userStore.currentUser?.userId,
      userStore.currentUser?.user?.id,
      userStore.currentUser?.username,
      userStore.currentUser?.userName,
      userStore.wallet?.id,
      userStore.currentUser?.wallet?.id
    ].join('|'),
  () => {
    fetchRecentTransactions()
  },
  { immediate: true }
)

const viewTransaction = (transaction) => {
  void transaction
}
</script>
