<template>
  <div :class="['flex items-center justify-between rounded-lg border p-4', colorClass]">
    <div>
      <p class="text-xs font-medium text-gray-500">{{ label }}</p>
      <p class="text-lg font-semibold text-gray-900">{{ value }}</p>
    </div>
    <span :class="['text-2xl', iconClass]">{{ icon }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, default: '' },
  color: { type: String, default: 'blue' }
})

const colorMap = {
  red: { border: 'border-red-100', bg: 'bg-red-50', text: 'text-red-600' },
  green: { border: 'border-green-100', bg: 'bg-green-50', text: 'text-green-600' },
  blue: { border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { border: 'border-purple-100', bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { border: 'border-orange-100', bg: 'bg-orange-50', text: 'text-orange-600' }
}

const colorClass = computed(() => {
  const selected = colorMap[props.color] || colorMap.blue
  return `${selected.border} ${selected.bg}`
})

const iconClass = computed(() => {
  const selected = colorMap[props.color] || colorMap.blue
  return selected.text
})
</script>
