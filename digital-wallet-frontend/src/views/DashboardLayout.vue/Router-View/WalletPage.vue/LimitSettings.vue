<template>
  <BaseCard title="Daily Limit Settings">
    <div class="mb-4">
      <p>Current Daily Limit: ₦{{ formatBalance(wallet.dailyLimit) }}</p>
      <p>Spent Today: ₦{{ formatBalance(wallet.spentToday) }}</p>
      <p>Remaining: ₦{{ formatBalance(wallet.dailyLimit - wallet.spentToday) }}</p>
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
import BaseCard from './base/BaseCard.vue'
import BaseInput from './base/BaseInput.vue'
import BaseButton from './base/BaseButton.vue'

const emit = defineEmits(['update'])

const userStore = useUserStore()
const newLimit = ref('')
const loading = ref(false)

const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-NG').format(balance)
}

const updateLimit = async () => {
  loading.value = true
  try {
    await walletApi.setDailyLimit(userStore.wallet.id, parseFloat(newLimit.value))
    emit('update')
  } 
  catch (error) {
    console.error('Error updating limit:', error)
  } 
  finally {
    loading.value = false
  }
}
</script>