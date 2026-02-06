<template>
  <BaseModal :show="true" :title="'Transaction Details'" @close="$emit('close')">
    <div class="space-y-4">
      <p><strong>Reference:</strong> {{ transaction.reference }}</p>
      <p><strong>Type:</strong> {{ transaction.type }}</p>
      <p><strong>Amount:</strong> ₦{{ formatAmount(transaction.amount) }}</p>
      <p><strong>Description:</strong> {{ transaction.description }}</p>
      <p><strong>Date:</strong> {{ formatDate(transaction.date) }}</p>
      <p><strong>Status:</strong> {{ transaction.status }}</p>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './base/BaseModal.vue'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-NG').format(Math.abs(amount))
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}
</script>