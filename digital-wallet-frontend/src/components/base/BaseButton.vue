<template>
    <button :type="type" :class="[ 'btn', variantClass, size === 'sm' ? 'text-sm py-1 px-2' : 'text-base py-2 px-4', { 'opacity-50 cursor-not-allowed': disabled || loading} ]" :disabled="disabled || loading" @click="$emit('click')">
        <span v-if="loading" class="mr-2">Loading...</span>
        <slot />
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    type: { type: String, default: 'button' },
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
})

const variantClass = computed(() => {
    if (props.variant === 'danger') return 'btn-danger'
    return props.variant === 'primary' ? 'btn-primary' : 'btn-secondary'
})

defineEmits(['click'])
</script>
