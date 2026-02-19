<template>
  <button :class="['flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition', colorClass]" @click="$emit('click')">
    <span class="text-2xl mb-2">{{ icon }}</span>
    <span class="text-sm font-medium">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const colorClassMap = {
  green: 'bg-green-100 hover:bg-green-200',
  blue: 'bg-blue-100 hover:bg-blue-200',
  purple: 'bg-purple-100 hover:bg-purple-200',
  orange: 'bg-orange-100 hover:bg-orange-200'
}

const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'blue' }
})

const colorClass = computed(() => colorClassMap[props.color] || colorClassMap.blue)

defineEmits(['click'])
</script>
