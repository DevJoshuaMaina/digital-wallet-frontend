<template>
  <BaseCard title="Daily Limit Settings">
    <div class="mb-4">
      <p>Current Daily Limit: KES {{ formatBalance(wallet.dailyLimit) }}</p>
      <p>Spent Today: KES {{ formatBalance(wallet.spentToday) }}</p>
      <p>Remaining: KES {{ formatBalance(wallet.dailyLimit - wallet.spentToday) }}</p>
    </div>
    <form @submit.prevent="updateLimit">
      <BaseInput v-model="newLimit" type="number" label="New Daily Limit" placeholder="Enter new limit"/>
      <BaseButton type="submit" :loading="loading" class="mt-4">Update Limit</BaseButton>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import walletApi from '@/services/walletApi'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  wallet: { type: Object, required: true }
})

const emit = defineEmits(['update', 'error'])

const userStore = useUserStore()
const newLimit = ref('')
const loading = ref(false)

const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-KE').format(Number(balance || 0))
}

const updateLimit = async () => {
  loading.value = true
  try {
    await walletApi.setDailyLimit(userStore.wallet.id, parseFloat(newLimit.value))
    emit('update')
  }
  catch (error) {
    emit('error', error)
  }
  finally {
    loading.value = false
  }
}
</script>
