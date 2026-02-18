<template>
  <BaseCard title="Recent Transactions">
    <div v-if="loading" class="text-center py-4">
      <BaseLoader />
    </div>
    <BaseAlert v-else-if="errorMessage" type="error" :message="errorMessage" />
    <div v-else-if="transactions.length">
      <TransactionItem v-for="transaction in transactions" :key="transaction.id" :transaction="transaction" @click="viewTransaction"/>
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
import BaseAlert from '@/components/base/BaseAlert.vue'
import TransactionItem from '@/views/DashboardLayout.vue/Router-View/TransactionsPage.vue/TransactionItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const transactions = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  const userId = userStore.currentUser?.id
  if (!userId) {
    loading.value = false
    return
  }

  try {
    const response = await transactionApi.getTransactions(userId, { limit: 5 })
    const records = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : []
    transactions.value = records
  } 
  catch (error) {
    errorMessage.value = 'Unable to load recent transactions.'
  }
  finally {
    loading.value = false
  }
})

const viewTransaction = (transaction) => {
  // Placeholder: Could open a modal or navigate
  console.log('View transaction:', transaction)
}
</script>
