<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Transfer Money</h1>
    <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
    <BaseCard v-if="transferSuccess">
      <h3 class="mb-3 text-lg font-semibold">Transfer Successful</h3>
      <p class="mb-1 text-sm text-gray-700">Recipient: <strong>@{{ transferSuccess.toUsername }}</strong></p>
      <p class="mb-1 text-sm text-gray-700">Amount: <strong>{{ formatCurrency(transferSuccess.amount) }}</strong></p>
      <p class="mb-4 text-sm text-gray-700">Reference: <strong>{{ transferSuccess.reference }}</strong></p>
      <BaseButton @click="startNewTransfer">Make Another Transfer</BaseButton>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-4 text-lg font-semibold">Find Recipient</h3>
      <BaseInput
        v-model="recipientQuery"
        label="Username"
        placeholder="Enter recipient username"
        :error="errors.recipient"
        @input="searchRecipient"
      />
      <p v-if="searchingRecipient" class="mt-2 text-sm text-gray-500">Searching recipient...</p>
      <div v-if="recipient" class="mt-4 rounded-lg bg-gray-50 p-4">
        <p class="font-medium">{{ recipient.fullName }}</p>
        <p class="text-sm text-gray-600">@{{ recipient.username }}</p>
      </div>
    </BaseCard>

    <BaseCard v-if="recipient">
      <h3 class="mb-4 text-lg font-semibold">Transfer Amount</h3>
      <div class="mb-4 text-center">
        <input
          v-model="transferForm.amount"
          type="number"
          class="w-full border-none text-center text-3xl font-bold focus:outline-none"
          placeholder="0.00"
        />
        <p class="mt-2 text-sm text-gray-600">Available: {{ formatCurrency(userStore.balance) }}</p>
      </div>
    </BaseCard>

    <BaseCard v-if="recipient && transferForm.amount">
      <h3 class="mb-4 text-lg font-semibold">Confirm Transfer</h3>
      <div class="mb-4">
        <p><strong>To:</strong> {{ recipient.fullName }} (@{{ recipient.username }})</p>
        <p><strong>Amount:</strong> {{ formatCurrency(transferForm.amount) }}</p>
      </div>
      <form class="space-y-4" @submit.prevent="handleTransfer">
        <BaseInput
          v-model="transferForm.pin"
          type="password"
          label="Enter PIN"
          :error="errors.pin"
          placeholder="4-digit PIN"
        />
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
import { normalizeTransactionStatus } from '@/utils/transactionNormalizer'
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
const getCurrentUserIdentifier = () =>
  userStore.currentUser?.id ||
  userStore.currentUser?.userId ||
  userStore.currentUser?.user?.id ||
  userStore.wallet?.id ||
  userStore.currentUser?.wallet?.id ||
  userStore.currentUser?.username ||
  userStore.currentUser?.userName ||
  null

async function searchRecipient() {
  clearTimeout(recipientSearchTimeout)

  if (recipientQuery.value.trim().length < 2) {
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
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol'
  }).format(Number(amount || 0))
}

async function handleTransfer() {
  loading.value = true
  errors.value = {}

  if (!recipient.value?.username) {
    errors.value = { recipient: 'Select a valid recipient before transferring.' }
    loading.value = false
    return
  }

  const currentUsername = userStore.currentUser?.username || userStore.currentUser?.userName
  if (currentUsername && recipient.value.username === currentUsername) {
    errors.value = { recipient: 'You cannot transfer to your own account.' }
    loading.value = false
    return
  }

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

  if (parsedAmount > Number(userStore.balance || 0)) {
    errors.value = { general: 'Insufficient balance for this transfer.' }
    loading.value = false
    return
  }

  if (!pinRegex.test(transferForm.value.pin.trim())) {
    errors.value = { pin: 'PIN must be 4-6 digits.' }
    loading.value = false
    return
  }

  let optimisticReference = ''
  try {
    optimisticReference = `TRF-${Date.now()}`
    const optimisticTransaction = transactionStore.addLocalTransaction({
      transactionId: optimisticReference,
      referenceNumber: optimisticReference,
      description: `Transfer to @${recipient.value.username}`,
      status: 'PENDING',
      amount: parsedAmount,
      type: 'debit',
      timestamp: new Date().toISOString(),
      toUsername: recipient.value.username
    })

    const transferData = {
      fromWalletId: userStore.wallet.id,
      toUsername: recipient.value.username,
      toUserId: recipient.value.id ?? recipient.value.userId ?? null,
      toWalletId: recipient.value.wallet?.id ?? recipient.value.walletId ?? null,
      amount: parsedAmount,
      pin: transferForm.value.pin
    }

    const transferResponse = await transactionStore.createTransfer(transferData)

    recipient.value = null
    recipientQuery.value = ''
    transferForm.value = { amount: '', pin: '' }
    const reference =
      transferResponse?.data?.referenceNumber ||
      transferResponse?.referenceNumber ||
      transferResponse?.data?.transactionId ||
      transferResponse?.transactionId ||
      optimisticReference
    const resolvedStatus = normalizeTransactionStatus(transferResponse?.data ?? transferResponse ?? { status: 'SUCCESSFUL' })
    const updatedTransaction = transactionStore.updateLocalTransaction(
      optimisticTransaction?.transactionId || optimisticReference,
      {
        transactionId: transferResponse?.data?.transactionId || transferResponse?.transactionId || reference,
        referenceNumber: reference,
        status: resolvedStatus,
        timestamp: transferResponse?.data?.timestamp || transferResponse?.timestamp || new Date().toISOString()
      }
    )

    if (updatedTransaction?.status === 'SUCCESSFUL') {
      userStore.setWallet({
        ...userStore.wallet,
        balance: userStore.balance - parsedAmount
      })
    }

    transferSuccess.value = {
      toUsername: transferData.toUsername,
      amount: parsedAmount,
      reference
    }

    const userIdentifier = getCurrentUserIdentifier()
    if (userIdentifier) {
      transactionStore.fetchTransactions(userIdentifier, {
        page: 0,
        size: 10,
        username: userStore.currentUser?.username || userStore.currentUser?.userName,
        walletId: userStore.wallet?.id
      })
    }
    toastStore.success('Transfer request submitted successfully.')
  }
  catch (error) {
    const apiError = handleApiError(error)
    transactionStore.updateLocalTransaction(optimisticReference, { status: 'FAILURE' })
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

