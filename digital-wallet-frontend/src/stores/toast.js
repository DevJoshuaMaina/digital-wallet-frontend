import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function removeToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function pushToast(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function success(message, duration) {
    pushToast(message, 'success', duration)
  }

  function error(message, duration) {
    pushToast(message, 'error', duration)
  }

  function info(message, duration) {
    pushToast(message, 'info', duration)
  }

  function warning(message, duration) {
    pushToast(message, 'warning', duration)
  }

  return {
    toasts,
    removeToast,
    pushToast,
    success,
    error,
    info,
    warning
  }
})
