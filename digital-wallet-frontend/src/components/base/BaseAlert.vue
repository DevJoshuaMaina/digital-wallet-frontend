<template>
    <div :class="[ 'p-4 rounded-lg mb-4', type === 'success' ? 'bg-green-100 text-green-800' :type === 'error' ? 'bg-red-100 text-red-800' :type === 'warning' ? 'bg-yellow-100 text-yellow-800' :'bg-blue-100 text-blue-800']">{{ message }}</div>
</template>

<script setup>
    import { onMounted } from 'vue'

    const props = defineProps({
        type: { type: String, default: 'info'},
        message: String,
        autoDismiss: { type: Boolean, default: false}
    })

    onMounted(() => {
        if (props.autoDismiss) {
            setTimeout(() => {
                // Auto-dismiss logic (could emit an event to parent)
            }, 5000)
        }
    })
</script>