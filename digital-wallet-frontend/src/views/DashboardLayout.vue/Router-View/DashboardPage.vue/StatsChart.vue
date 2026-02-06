<template>
  <BaseCard title="Transaction Stats">
    <div v-if="loading" class="text-center py-4">
      <BaseLoader />
    </div>
    <div v-else class="space-y-4">
      <!-- Placeholder for chart; replace with Chart.js if needed -->
      <div class="bg-gray-100 p-4 rounded-lg text-center">
        <p class="text-lg font-semibold">Visual Chart Placeholder</p>
        <p class="text-sm text-gray-500">Install Chart.js for actual charts</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <StatsCard label="Total Sent" :value="'₦' + formatNumber(stats.sent)" icon="📤" color="red" />
        <StatsCard label="Total Received" :value="'₦' + formatNumber(stats.received)" icon="📥" color="green" />
      </div>
      <p class="text-sm text-gray-500">Monthly breakdown: {{ stats.monthly || 'N/A' }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import transactionApi from '@/services/transactionApi'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import StatsCard from './StatsCard.vue'

const userStore = useUserStore()
const stats = ref({ sent: 0, received: 0, monthly: '' })
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await transactionApi.getTransactionStats(userStore.currentUser.id)
    stats.value = response
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-NG').format(num)
}
</script>
