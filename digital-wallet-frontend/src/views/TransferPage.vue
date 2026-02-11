<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Transfer Money</h1>
    
    <!-- Step 1: Recipient Search -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Find Recipient</h3>
      <BaseInput v-model="recipientQuery" label="Username" placeholder="Enter recipient username" :error="errors.recipient" @input="searchRecipient"/>
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
import userApi from '@/services/userApi'
import { useTransactionStore } from '@/stores/transaction'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const userStore = useUserStore()
const transactionStore = useTransactionStore()

const recipientQuery = ref('')
const recipient = ref(null)
const transferForm = ref({ amount: '', pin: '' })
const errors = ref({})
const loading = ref(false)

async function searchRecipient() {
  if (recipientQuery.value.length < 3) return
  
  try {
    const response = await userApi.getUserByUsername(recipientQuery.value)
    recipient.value = response.data
    errors.value = { ...errors.value, recipient: '' }
  }
  catch (error) {
    const apiError = handleApiError(error)
    recipient.value = null
    errors.value = { ...errors.value, recipient: apiError.message }
  }
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
  
  try {
    const transferData = {
      fromWalletId: userStore.wallet.id,
      toUsername: recipient.value.username,
      amount: parseFloat(transferForm.value.amount),
      pin: transferForm.value.pin
    }
    
    await transactionStore.createTransfer(transferData)
    
    // Update balance
    userStore.setWallet({ 
      ...userStore.wallet, 
      balance: userStore.balance - parseFloat(transferForm.value.amount) 
    })
    
    // Reset form
    recipient.value = null
    recipientQuery.value = ''
    transferForm.value = { amount: '', pin: '' }
    
  }
  catch (error) {
    const apiError = handleApiError(error)
    errors.value = { pin: apiError.message }
  }
  finally {
    loading.value = false
  }
}
</script>  
