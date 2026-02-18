<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Wallet Management</h1>
    <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
    <div v-if="resolvingWallet" class="text-center py-8">
      <BaseLoader />
    </div>
    <EmptyState
      v-else-if="!userStore.wallet"
      message="Wallet details are not available yet."
      icon="W"
    />
    <template v-else>
      <BaseCard>
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Current Balance</h3>
          <p class="text-4xl font-bold text-primary-600 mb-4">{{ formatCurrency(userStore.balance) }}</p>
          <p class="text-sm text-gray-600">Wallet: {{ userStore.wallet?.walletNumber }}</p>
        </div>
      </BaseCard>

      <BaseCard>
        <h3 class="text-lg font-semibold mb-4">Add Money</h3>
        <form @submit.prevent="handleAddMoney" class="space-y-4">
          <BaseInput v-model="addMoneyForm.amount" type="number" label="Amount" :error="errors.amount" placeholder="Enter amount to add" />
          <BaseButton type="submit" variant="primary" :loading="loading">Add Money</BaseButton>
        </form>
      </BaseCard>

      <BaseCard>
        <h3 class="text-lg font-semibold mb-4">Daily Transaction Limit</h3>
        <div class="flex items-center justify-between">
          <span>Current Limit: {{ formatCurrency(userStore.wallet?.dailyLimit || 0) }}</span>
          <BaseButton variant="secondary" @click="showLimitModal = true">Update Limit</BaseButton>
        </div>
      </BaseCard>

      <BaseModal :show="showLimitModal" title="Update Daily Limit" @close="showLimitModal = false">
        <form @submit.prevent="handleUpdateLimit" class="space-y-4">
          <BaseInput v-model="limitForm.limit" type="number" label="New Daily Limit" :error="errors.limit" placeholder="Enter new limit"/>
          <div class="flex space-x-2">
            <BaseButton type="submit" variant="primary" :loading="loading">Update</BaseButton>
            <BaseButton variant="secondary" @click="showLimitModal = false">Cancel</BaseButton>
          </div>
        </form>
      </BaseModal>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import walletApi from '@/services/walletApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const toastStore = useToastStore()

const addMoneyForm = ref({ amount: '' })
const limitForm = ref({ limit: '' })
const errors = ref({})
const loading = ref(false)
const resolvingWallet = ref(false)
const showLimitModal = ref(false)

onMounted(async () => {
  if (userStore.wallet?.id || !userStore.currentUser) return
  resolvingWallet.value = true
  try {
    const resolvedWallet = await walletApi.resolveWallet(userStore.currentUser)
    if (resolvedWallet) {
      userStore.setWallet(resolvedWallet)
    }
  }
  catch {
    errors.value.general = 'Unable to load wallet details at the moment.'
  }
  finally {
    resolvingWallet.value = false
  }
})

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol'
  }).format(Number(amount || 0))
}

async function handleAddMoney() {
  loading.value = true
  errors.value = {}

  if (!userStore.wallet?.id) {
    errors.value.general = 'Wallet is not available for this account yet. Please re-login and try again.'
    loading.value = false
    return
  }

  const parsedAmount = parseFloat(addMoneyForm.value.amount)
  if (!parsedAmount || parsedAmount <= 0) {
    errors.value.amount = 'Enter a valid amount greater than zero.'
    loading.value = false
    return
  }

  try {
    await walletApi.addMoney(userStore.wallet.id, addMoneyForm.value)
    userStore.setWallet({ ...userStore.wallet, balance: userStore.balance + parsedAmount })
    addMoneyForm.value.amount = ''
    toastStore.success('Money added successfully.')
  }
  catch (error) {
    const apiError = handleApiError(error)
    errors.value = { amount: apiError.message, general: apiError.message }
    toastStore.error(apiError.message)
  }
  finally {
    loading.value = false
  }
}

async function handleUpdateLimit() {
  loading.value = true
  errors.value = {}

  if (!userStore.wallet?.id) {
    errors.value.general = 'Wallet is not available for this account yet. Please re-login and try again.'
    loading.value = false
    return
  }

  const parsedLimit = parseFloat(limitForm.value.limit)
  if (!parsedLimit || parsedLimit <= 0) {
    errors.value.limit = 'Enter a valid limit greater than zero.'
    loading.value = false
    return
  }

  try {
    await walletApi.setDailyLimit(userStore.wallet.id, parsedLimit)
    userStore.setWallet({ ...userStore.wallet, dailyLimit: parsedLimit })
    showLimitModal.value = false
    limitForm.value.limit = ''
    toastStore.success('Daily limit updated successfully.')
  }
  catch (error) {
    const apiError = handleApiError(error)
    const message = apiError.status === 500
      ? 'Daily limit update is temporarily unavailable. Please try again later.'
      : apiError.message
    errors.value = { limit: message, general: message }
    toastStore.error(message)
  }
  finally {
    loading.value = false
  }
}
</script>
