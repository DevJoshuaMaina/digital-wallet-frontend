<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Money Requests</h1>
    <BaseAlert v-if="requestStore.error" type="error" :message="requestStore.error" />

    <BaseCard>
      <div class="mb-4 flex gap-2">
        <BaseButton :variant="activeTab === 'incoming' ? 'primary' : 'secondary'" @click="activeTab = 'incoming'">
          Incoming
        </BaseButton>
        <BaseButton :variant="activeTab === 'outgoing' ? 'primary' : 'secondary'" @click="activeTab = 'outgoing'">
          Outgoing
        </BaseButton>
      </div>

      <div v-if="requestStore.loading" class="py-8 text-center">
        <BaseLoader />
      </div>

      <EmptyState
        v-else-if="activeRequests.length === 0"
        :message="activeTab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'"
        icon="R"
      />

      <div v-else class="space-y-3">
        <div
          v-for="request in activeRequests"
          :key="request.id"
          class="rounded-lg border border-gray-200 p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-semibold">
              {{ activeTab === 'incoming' ? `From @${request.requesterUsername}` : `To @${request.requestedFromUsername}` }}
            </p>
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass(request.status)">
              {{ request.status }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-600">Amount: {{ formatCurrency(request.amount) }}</p>
          <p class="mt-1 text-sm text-gray-600">Created: {{ formatDate(request.createdAt) }}</p>
          <p v-if="request.note" class="mt-1 text-sm text-gray-700">Note: {{ request.note }}</p>
          <p v-if="request.paidReference" class="mt-1 text-sm text-gray-700">Reference: {{ request.paidReference }}</p>

          <div v-if="activeTab === 'incoming' && request.status === 'PENDING'" class="mt-3 flex gap-2">
            <BaseButton @click="openPayModal(request)">Pay</BaseButton>
            <BaseButton variant="secondary" @click="decline(request)" :loading="processingId === request.id">Decline</BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseModal :show="showPayModal" title="Pay Request" @close="closePayModal">
      <form class="space-y-4" @submit.prevent="paySelectedRequest">
        <p v-if="selectedRequest" class="text-sm text-gray-700">
          Pay {{ formatCurrency(selectedRequest.amount) }} to @{{ selectedRequest.requesterUsername }}
        </p>
        <BaseInput
          v-model="payPin"
          type="password"
          label="PIN"
          placeholder="Enter 4-6 digit PIN"
          :error="payError"
        />
        <BaseInput
          v-model="confirmPayPin"
          type="password"
          label="Confirm PIN"
          placeholder="Re-enter PIN"
          :error="confirmPayError"
        />
        <div class="flex gap-2">
          <BaseButton type="submit" :loading="processingId === selectedRequest?.id">Confirm Payment</BaseButton>
          <BaseButton type="button" variant="secondary" @click="closePayModal">Cancel</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useRequestStore } from '@/stores/request'
import { useTransactionStore } from '@/stores/transaction'
import { handleApiError } from '@/utils/errorHandler'
import { normalizeTransactionStatus } from '@/utils/transactionNormalizer'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const toastStore = useToastStore()
const requestStore = useRequestStore()
const transactionStore = useTransactionStore()

const activeTab = ref('incoming')
const showPayModal = ref(false)
const selectedRequest = ref(null)
const payPin = ref('')
const confirmPayPin = ref('')
const payError = ref('')
const confirmPayError = ref('')
const processingId = ref('')

const username = computed(() =>
  userStore.currentUser?.username || userStore.currentUser?.userName || ''
)

const activeRequests = computed(() =>
  activeTab.value === 'incoming'
    ? requestStore.incomingRequests
    : requestStore.outgoingRequests
)

const refreshRequests = async () => {
  await requestStore.fetchRequests(username.value)
}

onMounted(refreshRequests)

watch(
  () => username.value,
  () => {
    refreshRequests()
  }
)

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    currencyDisplay: 'narrowSymbol'
  }).format(Number(amount || 0))

const formatDate = (value) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString()
}

const statusClass = (status) => {
  const token = String(status || '').toUpperCase()
  if (token === 'PAID') return 'bg-green-100 text-green-700'
  if (token === 'DECLINED') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

const openPayModal = (request) => {
  selectedRequest.value = request
  payPin.value = ''
  confirmPayPin.value = ''
  payError.value = ''
  confirmPayError.value = ''
  showPayModal.value = true
}

const closePayModal = () => {
  showPayModal.value = false
  selectedRequest.value = null
  payPin.value = ''
  confirmPayPin.value = ''
  payError.value = ''
  confirmPayError.value = ''
}

const paySelectedRequest = async () => {
  if (!selectedRequest.value) return
  const pin = payPin.value.trim()
  const confirmPin = confirmPayPin.value.trim()
  const amount = Number(selectedRequest.value.amount || 0)
  payError.value = ''
  confirmPayError.value = ''
  if (!/^\d{4,6}$/.test(pin)) {
    payError.value = 'PIN must be 4-6 digits.'
    return
  }
  if (!/^\d{4,6}$/.test(confirmPin)) {
    confirmPayError.value = 'Confirm PIN must be 4-6 digits.'
    return
  }
  if (pin !== confirmPin) {
    confirmPayError.value = 'PINs do not match.'
    return
  }
  if (!userStore.wallet?.id) {
    payError.value = 'Wallet is not available for this account.'
    return
  }
  if (amount <= 0) {
    payError.value = 'Invalid request amount.'
    return
  }
  if (amount > Number(userStore.balance || 0)) {
    payError.value = 'Insufficient balance for this request.'
    return
  }

  let optimisticReference = ''
  processingId.value = selectedRequest.value.id
  payError.value = ''
  try {
    optimisticReference = `REQPAY-${Date.now()}`
    const optimisticTransaction = transactionStore.addLocalTransaction({
      transactionId: optimisticReference,
      referenceNumber: optimisticReference,
      description: `Request payment to @${selectedRequest.value.requesterUsername}`,
      status: 'PENDING',
      amount,
      type: 'debit',
      timestamp: new Date().toISOString(),
      toUsername: selectedRequest.value.requesterUsername
    })

    const transferPayload = {
      fromWalletId: userStore.wallet?.id,
      toUsername: selectedRequest.value.requesterUsername,
      amount,
      pin
    }

    const transferResponse = await transactionStore.createTransfer(transferPayload)
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
        balance: Number(userStore.balance || 0) - amount
      })
    }

    await requestStore.markAsPaid(selectedRequest.value.id, reference)
    toastStore.success('Request paid successfully.')
    closePayModal()
  }
  catch (error) {
    const apiError = handleApiError(error)
    transactionStore.updateLocalTransaction(optimisticReference, { status: 'FAILURE' })
    payError.value = apiError.message
    toastStore.error(apiError.message)
  }
  finally {
    processingId.value = ''
  }
}

const decline = async (request) => {
  processingId.value = request.id
  try {
    await requestStore.declineRequest(request.id)
    toastStore.info('Request declined.')
  }
  catch (error) {
    const apiError = handleApiError(error)
    toastStore.error(apiError.message)
  }
  finally {
    processingId.value = ''
  }
}
</script>
