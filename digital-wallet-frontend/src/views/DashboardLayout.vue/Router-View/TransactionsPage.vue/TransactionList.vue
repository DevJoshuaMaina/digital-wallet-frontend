<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <BaseLoader />
    </div>
    <div v-else-if="transactions.length">
      <TransactionItem
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
        @click="$emit('transaction-click', transaction)"
      />
    </div>
    <EmptyState v-else message="No transactions found" icon="📭" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseLoader from './base/BaseLoader.vue'
import TransactionItem from './TransactionItem.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['transaction-click'])
</script>