<template>
    <div :class="['animate-spin rounded-full border-2 border-gray-300 border-t-primary-500', sizeClasses[size]]"></div>
</template>

<script setup>
    defineProps({
        size: { type: String, default: 'md' }
    })

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }
</script>