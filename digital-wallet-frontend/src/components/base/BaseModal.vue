<template>
    <teleport to="body">
        <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex-items-center justify-center z-50" @click="$emit( 'close' )">
            <div class="bg-white rounded=2xl p-6 max-w-md w-full mx-4" @click.stop>
                <header class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">{{ title }}</h2>
                    <button @click="$emit( 'close' )" class="text-gray-500">&times;</button>
                </header>
                <slot />
            </div>
        </div>
    </teleport>
</template>

<script setup>
    defineProps({
        show: { type: Boolean, default: false },
        title: String,
        maxWidth: { type: String, default: '500px' }
    })

    defineEmits(['close'])
</script>