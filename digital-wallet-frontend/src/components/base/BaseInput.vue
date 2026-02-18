<template>
    <div>
        <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :class="[ 'input-field', { 'border-red-500': error }]" @input="$emit('update:modelValue', $event.target.value)" />
        <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    modelValue: String,
    type: { type: String, default: 'text' },
    label: String,
    error: String,
    placeholder: String,
    disabled: { type: Boolean, default: false }
})

const id = ref(`input-${Math.random().toString(36).slice(2, 11)}`)

defineEmits(['update:modelValue'])
</script>
