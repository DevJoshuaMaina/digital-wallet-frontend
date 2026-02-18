<template>
  <div>
    <div v-if="isLoading" class="text-center py-8">
      <BaseLoader />
    </div>
    <div v-else-if="hasTransactions">
      <TransactionItem v-for="transaction in visibleTransactions" :key="transaction.id" :transaction="transaction" @click="$emit('transaction-click', transaction)"/>
    </div>
    <EmptyState v-else message="No transactions found" icon="📭" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import TransactionItem from './TransactionItem.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const isLoading = computed(() => props.loading)
const visibleTransactions = computed(() => props.transactions)
const hasTransactions = computed(() => visibleTransactions.value.length > 0)

defineEmits(['transaction-click'])
</script>

