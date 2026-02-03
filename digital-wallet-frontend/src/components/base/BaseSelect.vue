<template>
    <div>
        <label v-if="label" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <select :value="modelvalue" class="input-field" @change="$emit('update:modelValue', $event.target.value)">
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
    </div>
</template>

<script setup>
    defineProps({
        options: { type: Array, default: () => []},
        modelvalue: String,
        label: String
    })

    defineEmits(['update:modelValue'])
</script>