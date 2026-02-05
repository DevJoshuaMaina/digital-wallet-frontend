<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Wallet Management</h1>
    
    <!-- Balance Card -->
    <BaseCard>
      <div class="text-center">
        <h3 class="text-lg font-semibold mb-2">Current Balance</h3>
        <p class="text-4xl font-bold text-primary-600 mb-4">₦{{ formatCurrency(userStore.balance) }}</p>
        <p class="text-sm text-gray-600">Wallet: {{ userStore.wallet?.walletNumber }}</p>
      </div>
    </BaseCard>
    
    <!-- Add Money Form -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Add Money</h3>
      <form @submit.prevent="handleAddMoney" class="space-y-4">
        <BaseInput v-model="addMoneyForm.amount" type="number" label="Amount" :error="errors.amount" placeholder="Enter amount to add" />
        <BaseButton type="submit" variant="primary" :loading="loading">Add Money</BaseButton>
      </form>
    </BaseCard>
    
    <!-- Daily Limit -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Daily Transaction Limit</h3>
      <div class="flex items-center justify-between">
        <span>Current Limit: ₦{{ formatCurrency(userStore.wallet?.dailyLimit || 0) }}</span>
        <BaseButton variant="secondary" @click="showLimitModal = true">Update Limit</BaseButton>
      </div>
    </BaseCard>
    
    <!-- Update Limit Modal -->
    <BaseModal :show="showLimitModal" title="Update Daily Limit" @close="showLimitModal = false">
      <form @submit.prevent="handleUpdateLimit" class="space-y-4">
        <BaseInput v-model="limitForm.limit" type="number" label="New Daily Limit" :error="errors.limit" placeholder="Enter new limit"/>
        <div class="flex space-x-2">
          <BaseButton type="submit" variant="primary" :loading="loading">Update</BaseButton>
          <BaseButton variant="secondary" @click="showLimitModal = false">Cancel</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import walletApi from '@/services/walletApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const userStore = useUserStore()

const addMoneyForm = ref({ amount: '' })
const limitForm = ref({ limit: '' })
const errors = ref({})
const loading = ref(false)
const showLimitModal = ref(false)

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount).replace('NGN', '₦')
}

async function handleAddMoney() {
  loading.value = true
  errors.value = {}
  
  try {
    await walletApi.addMoney(userStore.wallet.id, addMoneyForm.value)
    userStore.setWallet({ ...userStore.wallet, balance: userStore.balance + parseFloat(addMoneyForm.value.amount) })
    addMoneyForm.value.amount = ''
  } catch (error) {
    const apiError = handleApiError(error)
    errors.value = { amount: apiError.message }
  } finally {
    loading.value = false
  }
}

async function handleUpdateLimit() {
  loading.value = true
  errors.value = {}
  
  try {
    await walletApi.setDailyLimit(userStore.wallet.id, parseFloat(limitForm.value.limit))
    userStore.setWallet({ ...userStore.wallet, dailyLimit: parseFloat(limitForm.value.limit) })
    showLimitModal.value = false
    limitForm.value.limit = ''
  } catch (error) {
    const apiError = handleApiError(error)
    errors.value = { limit: apiError.message }
  } finally {
    loading.value = false
  }
}
</script>