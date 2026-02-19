<template>
    <div>
        <label v-if="label" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <select :value="resolvedValue" class="input-field" @change="$emit('update:modelValue', $event.target.value)">
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
    </div>
</template>

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        options: { type: Array, default: () => [] },
        modelValue: { type: String, default: '' },
        modelvalue: { type: String, default: '' },
        label: String
    })

    const resolvedValue = computed(() => props.modelValue || props.modelvalue || '')

    defineEmits(['update:modelValue'])
</script>
