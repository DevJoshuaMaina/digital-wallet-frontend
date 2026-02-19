<template>
  <BaseModal :show="true" :title="modalTitle" @close="$emit('close')">
    <div class="space-y-4">
      <p><strong>Reference:</strong> {{ transaction.reference }}</p>
      <p><strong>Type:</strong> {{ transaction.type }}</p>
      <p><strong>Amount:</strong> KES {{ formattedAmount }}</p>
      <p><strong>Description:</strong> {{ transaction.description }}</p>
      <p><strong>Date:</strong> {{ formattedDate }}</p>
      <p><strong>Status:</strong> {{ transaction.status }}</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const modalTitle = computed(() => 'Transaction Details')

const formattedAmount = computed(() =>
  new Intl.NumberFormat('en-KE').format(Math.abs(Number(props.transaction.amount || 0)))
)

const formattedDate = computed(() => {
  const dateValue = props.transaction.date || props.transaction.timestamp || props.transaction.createdAt
  if (!dateValue) return 'N/A'
  const parsed = new Date(dateValue)
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString()
})
</script>
