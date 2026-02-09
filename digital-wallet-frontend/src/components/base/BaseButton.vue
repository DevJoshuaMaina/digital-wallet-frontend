<template>
    <button :class="[ 'btn', variant === 'primary' ? 'btn-primary' : 'btn-secondary', size === 'sm' ? 'text-sm py-1 px-2' : 'text-base py-2 px-4', { 'opacity-50 cursor-not-allowed': disabled || loading} ]" :disabled="disabled || loading" @click="$emit('click')">
        <span v-if="loading" class="mr-2">Loading...</span>
        <slot />
    </button>
</template>

<script setup>
defineProps({
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>