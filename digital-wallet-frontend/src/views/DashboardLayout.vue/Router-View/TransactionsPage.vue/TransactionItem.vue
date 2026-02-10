<template>
  <div class="flex items-center justify-between p-4 border-b" @click="$emit('click')">
    <div class="flex items-center">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
        <span class="text-primary-600">{{ icon }}</span>
      </div>
      <div>
        <p class="font-semibold">{{ transaction.description }}</p>
        <p class="text-sm text-gray-500">{{ formattedDate }}</p>
      </div>
    </div>
    <p :class="['font-bold', amountClass]">₦{{ formattedAmount }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const icon = computed(() => (props.transaction.type === 'credit' ? '+' : '-'))

const formattedDate = computed(() =>
  new Date(props.transaction.date).toLocaleDateString()
)

const formattedAmount = computed(() =>
  Math.abs(props.transaction.amount).toLocaleString()
)

const amountClass = computed(() =>
  props.transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
)

defineEmits(['click'])
</script>
