<template>
    <div :class="['card', { 'p-0': noPadding }]">
        <header v-if="$slots.header" class="mb-4">
            <slot name="header" />
        </header>
        <slot />
        <footer v-if="$slots.footer" class="mt-4">
            <slot name="footer" />
        </footer>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    subtitle: String,
    noPadding: { type: Boolean, default: false }
})
</script>