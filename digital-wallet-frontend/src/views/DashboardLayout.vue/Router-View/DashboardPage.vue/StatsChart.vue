<template>
  <BaseCard title="Transaction Stats">
    <div v-if="loading" class="py-4 text-center">
      <BaseLoader />
    </div>
    <BaseAlert v-else-if="errorMessage" type="error" :message="errorMessage" />
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <canvas ref="chartCanvas" aria-label="Transaction statistics chart" role="img"></canvas>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <StatsCard label="Total Sent" :value="'₦' + formatNumber(stats.sent)" icon="📤" color="red" />
        <StatsCard label="Total Received" :value="'₦' + formatNumber(stats.received)" icon="📥" color="green" />
      </div>
      <p class="text-sm text-gray-500">{{ chartSummary }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import transactionApi from '@/services/transactionApi'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import StatsCard from './StatsCard.vue'

Chart.register(...registerables)

const userStore = useUserStore()
const stats = ref({ sent: 0, received: 0, monthly: '' })
const loading = ref(true)
const errorMessage = ref('')
const chartCanvas = ref(null)
let chartInstance = null

const buildFallbackMonthlyData = () => {
  const now = new Date()
  const labels = []

  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(month.toLocaleString('en-US', { month: 'short' }))
  }

  return {
    labels,
    sent: new Array(6).fill(0),
    received: new Array(6).fill(0),
    hasMonthlyData: false
  }
}

const normalizeMonthlyData = (monthly) => {
  const fallback = buildFallbackMonthlyData()

  if (!monthly) {
    return fallback
  }

  if (Array.isArray(monthly)) {
    if (monthly.length === 0) {
      return fallback
    }

    if (monthly.every((value) => typeof value === 'number')) {
      const labels = fallback.labels.slice(-monthly.length)
      return {
        labels,
        sent: monthly,
        received: new Array(monthly.length).fill(0),
        hasMonthlyData: true
      }
    }

    if (monthly.every((value) => typeof value === 'object' && value !== null)) {
      const labels = []
      const sent = []
      const received = []

      monthly.forEach((item, index) => {
        const label = item.month || item.label || item.name || item.date || `M${index + 1}`
        labels.push(String(label).slice(0, 10))
        sent.push(Number(item.sent ?? item.debit ?? item.outgoing ?? item.totalSent ?? 0))
        received.push(Number(item.received ?? item.credit ?? item.incoming ?? item.totalReceived ?? 0))
      })

      return { labels, sent, received, hasMonthlyData: true }
    }
  }

  if (typeof monthly === 'object') {
    const labels = Object.keys(monthly)
    const sent = []
    const received = []

    labels.forEach((label) => {
      const value = monthly[label]
      if (typeof value === 'number') {
        sent.push(value)
        received.push(0)
        return
      }

      sent.push(Number(value?.sent ?? value?.debit ?? value?.outgoing ?? 0))
      received.push(Number(value?.received ?? value?.credit ?? value?.incoming ?? 0))
    })

    return {
      labels: labels.length ? labels : fallback.labels,
      sent: sent.length ? sent : fallback.sent,
      received: received.length ? received : fallback.received,
      hasMonthlyData: labels.length > 0
    }
  }

  return fallback
}

const chartData = computed(() => normalizeMonthlyData(stats.value.monthly))

const chartSummary = computed(() =>
  chartData.value.hasMonthlyData
    ? 'Monthly transaction trend for sent and received values.'
    : 'Monthly breakdown unavailable; displaying current totals.'
)

const renderChart = () => {
  if (!chartCanvas.value) {
    return
  }

  if (chartInstance) {
    chartInstance.destroy()
  }

  if (chartData.value.hasMonthlyData) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: chartData.value.labels,
        datasets: [
          {
            label: 'Sent',
            data: chartData.value.sent,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            fill: true,
            tension: 0.35
          },
          {
            label: 'Received',
            data: chartData.value.received,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
  else {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: ['Sent', 'Received'],
        datasets: [
          {
            label: 'Total',
            data: [stats.value.sent, stats.value.received],
            backgroundColor: ['rgba(239, 68, 68, 0.65)', 'rgba(16, 185, 129, 0.65)'],
            borderColor: ['#ef4444', '#10b981'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

onMounted(async () => {
  const userId = userStore.currentUser?.id
  if (!userId) {
    loading.value = false
    return
  }

  try {
    const response = await transactionApi.getTransactionStats(userId)
    const normalizedStats = response?.data || response || {}
    stats.value = {
      sent: normalizedStats.sent ?? 0,
      received: normalizedStats.received ?? 0,
      monthly: normalizedStats.monthly || ''
    }

    await nextTick()
    renderChart()
  }
  catch (error) {
    errorMessage.value = 'Unable to load transaction stats.'
  }
  finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-NG').format(num)
}
</script>

<style scoped>
canvas {
  min-height: 250px;
}
</style>
