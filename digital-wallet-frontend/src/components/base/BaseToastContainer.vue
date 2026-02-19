<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 w-[22rem] max-w-[calc(100vw-2rem)]">
    <transition-group name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['rounded-lg shadow-lg p-4 border', typeClassMap[toast.type] || typeClassMap.info]"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium">{{ toast.message }}</p>
          <button class="text-xs opacity-80 hover:opacity-100" @click="toastStore.removeToast(toast.id)">Close</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const typeClassMap = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
