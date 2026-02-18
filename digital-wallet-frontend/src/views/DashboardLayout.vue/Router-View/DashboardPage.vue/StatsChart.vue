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
        <StatsCard label="Total Sent" :value="'NGN ' + formatNumber(stats.sent)" icon="S" color="red" />
        <StatsCard label="Total Received" :value="'NGN ' + formatNumber(stats.received)" icon="R" color="green" />
      </div>
      <p class="text-sm text-gray-500">{{ chartSummary }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useTransactionStore } from '@/stores/transaction'
import transactionApi from '@/services/transactionApi'
import { normalizeTransactionResponse } from '@/utils/transactionNormalizer'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import StatsCard from './StatsCard.vue'

Chart.register(...registerables)

const userStore = useUserStore()
const transactionStore = useTransactionStore()
const stats = ref({ sent: 0, received: 0, monthly: null })
const loading = ref(true)
const errorMessage = ref('')
const chartCanvas = ref(null)
let chartInstance = null

const createZeroArray = (length) => Array.from({ length }, () => 0)

const buildFallbackMonthlyData = () => {
  const now = new Date()
  const labels = []

  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(month.toLocaleString('en-US', { month: 'short' }))
  }

  return {
    labels,
    sent: createZeroArray(6),
    received: createZeroArray(6),
    hasMonthlyData: false
  }
}

const normalizeMonthlyData = (monthly) => {
  const fallback = buildFallbackMonthlyData()

  if (!monthly) return fallback

  if (Array.isArray(monthly)) {
    if (monthly.length === 0) return fallback

    if (monthly.every((value) => typeof value === 'number')) {
      return {
        labels: fallback.labels.slice(-monthly.length),
        sent: monthly,
        received: createZeroArray(monthly.length),
        hasMonthlyData: true
      }
    }

    if (monthly.every((value) => typeof value === 'object' && value !== null)) {
      const labels = []
      const sent = []
      const received = []

      monthly.forEach((item, index) => {
        labels.push(String(item.month || item.label || item.name || item.date || `M${index + 1}`).slice(0, 10))
        sent.push(Number(item.sent ?? item.debit ?? item.outgoing ?? item.totalSent ?? 0))
        received.push(Number(item.received ?? item.credit ?? item.incoming ?? item.totalReceived ?? 0))
      })

      return { labels, sent, received, hasMonthlyData: true }
    }

    return fallback
  }

  if (typeof monthly === 'object') {
    const labels = Object.keys(monthly)
    if (labels.length === 0) return fallback

    const sent = []
    const received = []

    labels.forEach((label) => {
      const value = monthly[label]
      if (typeof value === 'number') {
        sent.push(value)
        received.push(0)
      }
      else {
        sent.push(Number(value?.sent ?? value?.debit ?? value?.outgoing ?? 0))
        received.push(Number(value?.received ?? value?.credit ?? value?.incoming ?? 0))
      }
    })

    return { labels, sent, received, hasMonthlyData: true }
  }

  return fallback
}

const chartData = computed(() => normalizeMonthlyData(stats.value.monthly))

const chartSummary = computed(() =>
  chartData.value.hasMonthlyData
    ? 'Monthly transaction trend for sent and received values.'
    : 'Monthly breakdown unavailable; displaying current totals.'
)

const normalizeStats = (payload) => {
  const source = payload?.data ?? payload ?? {}
  const sent = Number(
    source.sent ??
    source.totalSent ??
    source.sentAmount ??
    source.totalOutgoing ??
    source.outgoingAmount ??
    source.debitAmount ??
    source.totalDebit ??
    source.debit ??
    source.outgoing ??
    source.amountSent ??
    0
  )
  const received = Number(
    source.received ??
    source.totalReceived ??
    source.receivedAmount ??
    source.totalIncoming ??
    source.incomingAmount ??
    source.creditAmount ??
    source.totalCredit ??
    source.credit ??
    source.incoming ??
    source.amountReceived ??
    0
  )

  return {
    sent,
    received,
    monthly:
      source.monthly ??
      source.monthlyStats ??
      source.monthlyBreakdown ??
      source.timeline ??
      source.breakdown ??
      null
  }
}

const normalizeTypeToken = (value) => String(value || '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_')

const inferTransactionDirection = (transaction) => {
  const typeToken = normalizeTypeToken(
    transaction.transactionType ||
    transaction.direction ||
    transaction.type
  )
  const descriptionToken = normalizeTypeToken(transaction.description || transaction.narration || transaction.remark)
  const currentUsername = String(userStore.currentUser?.username || userStore.currentUser?.userName || '').toLowerCase()
  const currentWalletId = String(userStore.wallet?.id || userStore.currentUser?.wallet?.id || '')

  const creditTypes = new Set(['credit', 'received', 'incoming', 'deposit', 'topup', 'add_money', 'refund'])
  const debitTypes = new Set(['debit', 'sent', 'outgoing', 'transfer', 'merchant_payment', 'payment', 'withdrawal'])

  const fromUsername = String(transaction.fromUsername || transaction.senderUsername || transaction.sourceUsername || '').toLowerCase()
  const toUsername = String(transaction.toUsername || transaction.recipientUsername || transaction.destinationUsername || '').toLowerCase()

  if (currentUsername) {
    if (fromUsername && fromUsername === currentUsername) return 'debit'
    if (toUsername && toUsername === currentUsername) return 'credit'
  }

  const fromWalletId = String(transaction.fromWalletId || transaction.sourceWalletId || '')
  const toWalletId = String(transaction.toWalletId || transaction.destinationWalletId || '')

  if (currentWalletId) {
    if (fromWalletId && fromWalletId === currentWalletId) return 'debit'
    if (toWalletId && toWalletId === currentWalletId) return 'credit'
  }

  if (descriptionToken.includes('transfer_to') || descriptionToken.includes('sent') || descriptionToken.includes('payment_to')) {
    return 'debit'
  }
  if (descriptionToken.includes('received') || descriptionToken.includes('from_')) {
    return 'credit'
  }

  if (debitTypes.has(typeToken)) return 'debit'
  if (creditTypes.has(typeToken)) return 'credit'

  const amount = Number(transaction.amount || 0)
  return amount < 0 ? 'debit' : 'credit'
}

const buildStatsFromTransactions = (payload) => {
  const { normalizedList } = normalizeTransactionResponse(payload)
  if (normalizedList.length === 0) return null

  let sent = 0
  let received = 0
  const monthlyMap = new Map()

  normalizedList.forEach((transaction) => {
    const amount = Number(transaction.amount || 0)
    const direction = inferTransactionDirection(transaction)
    const timestamp = transaction.timestamp || transaction.date || transaction.createdAt
    const parsed = timestamp ? new Date(timestamp) : null
    const monthKey =
      parsed && !Number.isNaN(parsed.getTime())
        ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
        : null

    if (direction === 'credit') {
      received += Math.abs(amount)
      if (monthKey) {
        const entry = monthlyMap.get(monthKey) || { month: monthKey, sent: 0, received: 0 }
        entry.received += Math.abs(amount)
        monthlyMap.set(monthKey, entry)
      }
    }
    else {
      sent += Math.abs(amount)
      if (monthKey) {
        const entry = monthlyMap.get(monthKey) || { month: monthKey, sent: 0, received: 0 }
        entry.sent += Math.abs(amount)
        monthlyMap.set(monthKey, entry)
      }
    }
  })

  const monthly = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)

  return { sent, received, monthly }
}

const fetchDerivedStatsFromTransactions = async (userId) => {
  const transactionsFallback = await transactionApi.getTransactions(userId, {
    page: 0,
    size: 100,
    username: userStore.currentUser?.username || userStore.currentUser?.userName,
    walletId: userStore.currentUser?.wallet?.id || userStore.wallet?.id
  })
  return buildStatsFromTransactions(transactionsFallback)
}

const mergeStats = (base, fallback) => {
  const baseSent = Number(base?.sent || 0)
  const fallbackSent = Number(fallback?.sent || 0)
  const baseReceived = Number(base?.received || 0)
  const fallbackReceived = Number(fallback?.received || 0)

  return {
    sent: Math.max(baseSent, fallbackSent),
    received: Math.max(baseReceived, fallbackReceived),
    monthly: base?.monthly || fallback?.monthly || null
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const renderChart = () => {
  if (!chartCanvas.value) return

  destroyChart()

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
          y: { beginAtZero: true }
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
          y: { beginAtZero: true }
        }
      }
    })
  }
}

const fetchStats = async (userId) => {
  loading.value = true
  errorMessage.value = ''
  stats.value = { sent: 0, received: 0, monthly: null }

  try {
    const response = await transactionApi.getTransactionStats(
      userId,
      null,
      userStore.currentUser?.username || userStore.currentUser?.userName,
      userStore.currentUser?.wallet?.id || userStore.wallet?.id
    )
    let normalized = normalizeStats(response)
    const derived = await fetchDerivedStatsFromTransactions(userId)
    if (derived) {
      normalized = mergeStats(normalized, derived)
    }

    stats.value = normalized
  }
  catch {
    try {
      const derived = await fetchDerivedStatsFromTransactions(userId)
      if (derived) {
        stats.value = {
          sent: derived.sent,
          received: derived.received,
          monthly: derived.monthly
        }
      }
      else {
        stats.value = { sent: 0, received: 0, monthly: null }
      }
    }
    catch {
      stats.value = { sent: 0, received: 0, monthly: null }
    }
  }
  finally {
    loading.value = false
  }

  await nextTick()
  renderChart()
}

watch(
  () =>
    userStore.currentUser?.username ||
    userStore.currentUser?.userName ||
    userStore.currentUser?.id ||
    userStore.currentUser?.userId ||
    userStore.currentUser?.user?.id,
  (userIdentifier) => {
    if (!userIdentifier) {
      loading.value = false
      destroyChart()
      return
    }

    fetchStats(userIdentifier)
  },
  { immediate: true }
)

watch(
  () =>
    transactionStore.allTransactions
      .map((transaction) =>
        `${transaction.id}|${transaction.type}|${transaction.amount}|${transaction.timestamp || transaction.date || transaction.createdAt || ''}`
      )
      .join('::'),
  async () => {
    const localDerived = buildStatsFromTransactions({ content: transactionStore.allTransactions })
    if (!localDerived) return

    stats.value = {
      sent: Number(localDerived.sent || 0),
      received: Number(localDerived.received || 0),
      monthly: localDerived.monthly || null
    }
    await nextTick()
    renderChart()
  }
)

onBeforeUnmount(() => {
  destroyChart()
})

const formatNumber = (num) => new Intl.NumberFormat('en-NG').format(num)
</script>

<style scoped>
canvas {
  min-height: 250px;
}
</style>
