<template>
  <div class="text-center">
    <input
      v-model="pin"
      type="password"
      maxlength="6"
      class="text-2xl text-center border rounded-lg p-2 w-32"
      placeholder="****"
      @input="validatePin"
    />
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pin = ref('')
const error = ref('')

const emit = defineEmits(['update:modelValue', 'complete'])

const validatePin = () => {
  if (pin.value.length < 4) {
    error.value = 'PIN must be 4-6 digits'
  } else {
    error.value = ''
    emit('update:modelValue', pin.value)
    if (pin.value.length >= 4) emit('complete')
  }
}
</script>