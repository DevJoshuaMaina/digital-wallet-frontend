<template>
  <button :class="['flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition', `bg-${color}-100 hover:bg-${color}-200`]" @click="$emit('click')">
    <span class="text-2xl mb-2">{{ icon }}</span>
    <span class="text-sm font-medium">{{ label }}</span>
  </button>
</template> 

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'blue' }
})

defineEmits(['click'])
</script>