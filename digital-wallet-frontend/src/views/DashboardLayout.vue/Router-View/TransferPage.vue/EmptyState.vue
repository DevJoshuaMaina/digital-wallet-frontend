<template>
  <div class="text-center py-12">
    <div class="text-6xl mb-4">{{ icon }}</div>
    <h3 class="text-xl font-semibold mb-2">{{ message }}</h3>
    <BaseButton v-if="actionLabel" @click="$emit('action')">{{ actionLabel }}</BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  message: { type: String, required: true },
  icon: { type: String, default: '📭' },
  actionLabel: String
})

defineEmits(['action'])
</script>
