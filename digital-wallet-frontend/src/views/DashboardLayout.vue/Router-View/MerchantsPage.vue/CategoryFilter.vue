<template>
  <div class="flex gap-2 mb-4">
    <BaseButton
      v-for="category in categories"
      :key="category"
      :variant="selectedCategory === category ? 'primary' : 'secondary'"
      @click="selectCategory(category)"
    >
      {{ category }}
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import BaseButton from './base/BaseButton.vue'

const emit = defineEmits(['change'])

const merchantStore = useMerchantStore()
const selectedCategory = ref('All')

const categories = ['All', 'Food', 'Retail', 'Utilities']

const selectCategory = (category) => {
  selectedCategory.value = category
  emit('change', category)
}
</script>