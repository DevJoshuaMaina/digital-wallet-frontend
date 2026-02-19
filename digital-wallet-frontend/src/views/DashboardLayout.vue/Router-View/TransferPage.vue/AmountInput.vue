<template>
  <div class="text-center">
    <input
      v-model="localValue"
      type="number"
      :max="max"
      class="text-4xl font-bold text-center border-none outline-none w-full"
      placeholder="0.00"
      @input="formatInput"
    />
    <p class="text-gray-500 mt-2">Available: KES {{ formatCurrency(max) }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 100000 }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-KE').format(value)
}

const formatInput = () => {
  let value = parseFloat(localValue.value) || 0
  if (value > props.max) value = props.max
  localValue.value = value
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})
</script> 