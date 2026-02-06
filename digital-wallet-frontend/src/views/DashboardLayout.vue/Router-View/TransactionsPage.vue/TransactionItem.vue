<template>
  <div class="flex items-center justify-between p-4 border-b" @click="$emit('click')">
    <div class="flex items-center">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
        <span class="text-primary-600">{{ getIcon(transaction.type) }}</span>
      </div>
      <div>
        <p class="font-semibold">{{ transaction.description }}</p>
        <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
      </div>
    </div>
    <p :class="['font-bold', transaction.amount > 0 ? 'text-green-600' : 'text-red-600']">
      ₦{{ formatAmount(transaction.amount) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const getIcon = (type) => {
  return type === 'credit' ? '+' : '-'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatAmount = (amount) => {
  return Math.abs(amount).toLocaleString()
}

defineEmits(['click'])
</script>