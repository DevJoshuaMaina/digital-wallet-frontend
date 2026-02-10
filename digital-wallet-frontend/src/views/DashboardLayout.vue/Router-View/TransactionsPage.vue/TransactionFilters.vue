<template>
  <BaseCard>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BaseSelect v-model="localFilters.type" :options="typeOptions" label="Transaction Type" @update:modelValue="updateFilters"/>
      <BaseSelect v-model="localFilters.status" :options="statusOptions" label="Status" @update:modelValue="updateFilters"/>
      <BaseInput v-model="localFilters.dateRange" type="date" label="Date Range" @update:modelValue="updateFilters"/>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCard from './base/BaseCard.vue'
import BaseSelect from './base/BaseSelect.vue'
import BaseInput from './base/BaseInput.vue'

const props = defineProps({
  filters: { type: Object, default: () => ({ type: '', status: '', dateRange: '' }) }
})

const emit = defineEmits(['filter-change'])

const localFilters = ref({ ...props.filters })

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' }
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' }
]

const updateFilters = () => {
  emit('filter-change', localFilters.value)
}

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>