<template>
  <BaseModal :show="true" :title="modalTitle" @close="$emit('close')">
    <div class="space-y-4">
      <p><strong>Reference:</strong> {{ transaction.reference }}</p>
      <p><strong>Type:</strong> {{ transaction.type }}</p>
      <p><strong>Amount:</strong> ₦{{ formattedAmount }}</p>
      <p><strong>Description:</strong> {{ transaction.description }}</p>
      <p><strong>Date:</strong> {{ formattedDate }}</p>
      <p><strong>Status:</strong> {{ transaction.status }}</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './base/BaseModal.vue'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const modalTitle = computed(() => 'Transaction Details')

const formattedAmount = computed(() =>
  new Intl.NumberFormat('en-NG').format(Math.abs(props.transaction.amount))
)

const formattedDate = computed(() =>
  new Date(props.transaction.date).toLocaleString()
)
</script>
