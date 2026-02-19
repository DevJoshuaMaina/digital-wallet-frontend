<template>
    <div class="flex justify-center mt-4">
        <button v-for="page in totalPages" :key="page" :class="[ 'mx-1 px-3 py-1 rounded', page === currentPage ? 'bg-primary-500 text-white' : 'bg-gray-200']" @click="$emit('page-change', page)">
            {{ page }}
        </button>
    </div>
</template>

<script setup>
    defineProps({
        currentPage: { type: Number, default: 1 },
        totalPages: { type: Number, default: 1 }
    })

    defineEmits([ 'page-change' ])
</script>