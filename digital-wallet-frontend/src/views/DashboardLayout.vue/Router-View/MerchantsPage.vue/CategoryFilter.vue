<template>
  <div class="flex gap-2 mb-4">
    <BaseButton
      v-for="category in categories"
      :key="category"
      :variant="selectedCategory === category ? 'primary' : 'secondary'"
      @click="selectCategory(category)"
    >
      {{ formatCategoryLabel(category) }}
    </BaseButton>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useMerchantStore } from '@/stores/merchant'
import BaseButton from '@/components/base/BaseButton.vue'

const emit = defineEmits(['change'])

const merchantStore = useMerchantStore()
const { categories, selectedCategory } = storeToRefs(merchantStore)

const selectCategory = (category) => {
  selectedCategory.value = category
  emit('change', category)
}

const formatCategoryLabel = (category) => {
  if (!category) return ''
  if (category === 'All') return 'All'
  return category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

