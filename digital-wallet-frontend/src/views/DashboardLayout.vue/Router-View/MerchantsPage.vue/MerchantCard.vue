<template>
  <BaseCard class="cursor-pointer" @click="$emit('select')">
    <div class="text-center">
      <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
      <h3 class="font-semibold">{{ merchant.name }}</h3>
      <p class="text-gray-500">{{ merchant.category }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/base/BaseCard.vue'

defineProps({
  merchant: { type: Object, required: true }
})

defineEmits(['select'])
</script>
