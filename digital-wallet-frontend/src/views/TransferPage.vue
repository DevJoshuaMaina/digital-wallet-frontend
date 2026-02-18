<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Transfer Money</h1>
    <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
    <BaseCard v-if="transferSuccess">
      <h3 class="text-lg font-semibold mb-3">Transfer Successful</h3>
      <p class="text-sm text-gray-700 mb-1">Recipient: <strong>@{{ transferSuccess.toUsername }}</strong></p>
      <p class="text-sm text-gray-700 mb-1">Amount: <strong>{{ formatCurrency(transferSuccess.amount) }}</strong></p>
      <p class="text-sm text-gray-700 mb-4">Reference: <strong>{{ transferSuccess.reference }}</strong></p>
      <BaseButton @click="startNewTransfer">Make Another Transfer</BaseButton>
    </BaseCard>
    
    <!-- Step 1: Recipient Search -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Find Recipient</h3>
      <BaseInput v-model="recipientQuery" label="Username" placeholder="Enter recipient username" :error="errors.recipient" @input="searchRecipient"/>
      <p v-if="searchingRecipient" class="text-sm text-gray-500 mt-2">Searching recipient...</p>
      <div v-if="recipient" class="mt-4 p-4 bg-gray-50 rounded-lg">
        <p class="font-medium">{{ recipient.fullName }}</p>
        <p class="text-sm text-gray-600">@{{ recipient.username }}</p>
      </div>
    </BaseCard>
    
    <!-- Step 2: Amount -->
    <BaseCard v-if="recipient">
      <h3 class="text-lg font-semibold mb-4">Transfer Amount</h3>
      <div class="text-center mb-4">
        <input v-model="transferForm.amount" type="number" class="text-3xl font-bold text-center border-none focus:outline-none w-full" placeholder="0.00"/>
        <p class="text-sm text-gray-600 mt-2">Available: ₦{{ formatCurrency(userStore.balance) }}</p>
      </div>
    </BaseCard>
    
    <!-- Step 3: PIN and Confirm -->
    <BaseCard v-if="recipient && transferForm.amount">
      <h3 class="text-lg font-semibold mb-4">Confirm Transfer</h3>
      <div class="mb-4">
        <p><strong>To:</strong> {{ recipient.fullName }} (@{{ recipient.username }})</p>
        <p><strong>Amount:</strong> ₦{{ formatCurrency(transferForm.amount) }}</p>
      </div>
      <form @submit.prevent="handleTransfer" class="space-y-4">
        <BaseInput v-model="transferForm.pin" type="password" label="Enter PIN" :error="errors.pin" placeholder="4-digit PIN"/>
        <BaseButton type="submit" variant="primary" :loading="loading" class="w-full">Transfer Money</BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import userApi from '@/services/userApi'
import { useTransactionStore } from '@/stores/transaction'
import { handleApiError } from '@/utils/errorHandler'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const userStore = useUserStore()
const transactionStore = useTransactionStore()
const toastStore = useToastStore()

const recipientQuery = ref('')
const recipient = ref(null)
const transferForm = ref({ amount: '', pin: '' })
const errors = ref({})
const loading = ref(false)
const searchingRecipient = ref(false)
const transferSuccess = ref(null)
const pinRegex = /^\d{4,6}$/
let recipientSearchTimeout = null

async function searchRecipient() {
  clearTimeout(recipientSearchTimeout)

  if (recipientQuery.value.length < 3) {
    recipient.value = null
    searchingRecipient.value = false
    return
  }

  recipientSearchTimeout = setTimeout(async () => {
    searchingRecipient.value = true
    try {
      const response = await userApi.getUserByUsername(recipientQuery.value.trim())
      recipient.value = response?.data || response
      errors.value = { ...errors.value, recipient: '' }
    }
    catch (error) {
      const apiError = handleApiError(error)
      recipient.value = null
      errors.value = { ...errors.value, recipient: apiError.message }
    }
    finally {
      searchingRecipient.value = false
    }
  }, 350)
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount).replace('NGN', '₦')
}

async function handleTransfer() {
  loading.value = true
  errors.value = {}

  if (!userStore.wallet?.id) {
    errors.value = { general: 'Wallet is not available for this account yet. Please re-login and try again.' }
    loading.value = false
    return
  }

  const parsedAmount = parseFloat(transferForm.value.amount)
  if (!parsedAmount || parsedAmount <= 0) {
    errors.value = { general: 'Enter a valid amount greater than zero.' }
    loading.value = false
    return
  }
  if (!pinRegex.test(transferForm.value.pin.trim())) {
    errors.value = { pin: 'PIN must be 4-6 digits.' }
    loading.value = false
    return
  }
  
  try {
    const transferData = {
      fromWalletId: userStore.wallet.id,
      toUsername: recipient.value.username,
      amount: parsedAmount,
      pin: transferForm.value.pin
    }
    
    const transferResponse = await transactionStore.createTransfer(transferData)
    
    // Update balance
    userStore.setWallet({ 
      ...userStore.wallet, 
      balance: userStore.balance - parsedAmount 
    })
    
    // Reset form
    recipient.value = null
    recipientQuery.value = ''
    transferForm.value = { amount: '', pin: '' }
    transferSuccess.value = {
      toUsername: transferData.toUsername,
      amount: parsedAmount,
      reference:
        transferResponse?.data?.referenceNumber ||
        transferResponse?.referenceNumber ||
        transferResponse?.data?.transactionId ||
        transferResponse?.transactionId ||
        `TRF-${Date.now()}`
    }
    toastStore.success('Transfer request submitted successfully.')
    
  }
  catch (error) {
    const apiError = handleApiError(error)
    errors.value = { general: apiError.message, pin: apiError.message }
    toastStore.error(apiError.message)
  }
  finally {
    loading.value = false
  }
}

function startNewTransfer() {
  transferSuccess.value = null
  recipient.value = null
  recipientQuery.value = ''
  transferForm.value = { amount: '', pin: '' }
  errors.value = {}
}
</script>  
