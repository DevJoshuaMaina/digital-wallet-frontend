<template>
  <BaseCard title="Recent Transactions">
    <div v-if="loading" class="text-center py-4">
      <BaseLoader />
    </div>
    <div v-else-if="transactions.length">
      <TransactionItem
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
        @click="viewTransaction"
      />
      <router-link to="/transactions" class="text-primary-600 mt-4 block text-center">View All</router-link>
    </div>
    <EmptyState v-else message="No recent transactions" icon="📭" />
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import transactionApi from '@/services/transactionApi'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import TransactionItem from '@/views/DashboardLayout.vue/Router-View/TransactionsPage.vue/TransactionItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const transactions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await transactionApi.getTransactions(userStore.currentUser.id, { limit: 5 })
    transactions.value = response
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
  } finally {
    loading.value = false
  }
})

const viewTransaction = (transaction) => {
  // Placeholder: Could open a modal or navigate
  console.log('View transaction:', transaction)
}
</script>
