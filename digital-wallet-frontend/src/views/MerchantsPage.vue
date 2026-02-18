<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Pay Merchants</h1>
    <BaseAlert v-if="errors.general || merchantStore.error" type="error" :message="errors.general || merchantStore.error" />

    <BaseCard>
      <h3 class="mb-4 text-lg font-semibold">Merchant Directory</h3>

      <BaseInput
        v-model="searchQuery"
        label="Search Merchant"
        placeholder="Search by merchant name or code"
      />

      <div class="mb-4 flex space-x-2 overflow-x-auto">
        <button
          v-for="category in merchantStore.categories"
          :key="category"
          class="whitespace-nowrap"
          :class="selectedCategory === category ? 'btn-primary' : 'btn-secondary'"
          @click="selectCategory(category)"
        >
          {{ formatCategory(category) }}
        </button>
      </div>

      <div v-if="merchantStore.loading" class="py-8 text-center">
        <BaseLoader />
      </div>

      <div v-else-if="filteredMerchants.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="merchant in filteredMerchants"
          :key="merchant.id"
          class="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
          @click="selectMerchant(merchant)"
        >
          <div class="flex items-center space-x-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <span class="text-xl">M</span>
            </div>
            <div>
              <h4 class="font-medium">{{ merchantDisplayName(merchant) }}</h4>
              <p class="text-sm text-gray-600">{{ formatCategory(merchant.category) }}</p>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else message="No merchants available in this category." icon="M" />
    </BaseCard>

    <BaseModal :show="showPaymentModal" title="Pay Merchant" @close="closePaymentModal">
      <div v-if="selectedMerchant" class="space-y-4">
        <div class="text-center">
          <h4 class="text-lg font-semibold">{{ merchantDisplayName(selectedMerchant) }}</h4>
          <p class="text-sm text-gray-600">{{ formatCategory(selectedMerchant.category) }}</p>
        </div>
        <form class="space-y-4" @submit.prevent="handlePayment">
          <BaseInput v-model="paymentForm.amount" type="number" label="Amount" :error="errors.amount" placeholder="Enter amount" />
          <BaseInput v-model="paymentForm.pin" type="password" label="PIN" :error="errors.pin" placeholder="4-digit PIN" />
          <BaseButton type="submit" variant="primary" :loading="loading" class="w-full">Pay Now</BaseButton>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="showReceiptModal" title="Payment Receipt" @close="showReceiptModal = false">
      <div v-if="paymentReceipt" class="space-y-3">
        <p><strong>Merchant:</strong> {{ paymentReceipt.merchantName }}</p>
        <p><strong>Amount:</strong> {{ paymentReceipt.amount }}</p>
        <p><strong>Reference:</strong> {{ paymentReceipt.reference }}</p>
        <p><strong>Status:</strong> {{ paymentReceipt.status }}</p>
        <BaseButton @click="showReceiptModal = false">Close</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import { useTransactionStore } from '@/stores/transaction'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { handleApiError } from '@/utils/errorHandler'
import { normalizeTransactionStatus } from '@/utils/transactionNormalizer'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import EmptyState from '@/components/EmptyState.vue'

const merchantStore = useMerchantStore()
const transactionStore = useTransactionStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const selectedCategory = ref('ALL')
const selectedMerchant = ref(null)
const showPaymentModal = ref(false)
const showReceiptModal = ref(false)
const paymentReceipt = ref(null)
const searchQuery = ref('')
const paymentForm = ref({ amount: '', pin: '' })
const errors = ref({})
const loading = ref(false)
const pinRegex = /^\d{4,6}$/
const getCurrentUserIdentifier = () =>
  userStore.currentUser?.id ||
  userStore.currentUser?.userId ||
  userStore.currentUser?.user?.id ||
  userStore.wallet?.id ||
  userStore.currentUser?.wallet?.id ||
  userStore.currentUser?.username ||
  userStore.currentUser?.userName ||
  null

const formatCategory = (value) => String(value || 'OTHER').replaceAll('_', ' ')
const merchantDisplayName = (merchant) => merchant?.merchantName || merchant?.name || merchant?.businessName || 'Unknown Merchant'

const filteredMerchants = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return merchantStore.merchants.filter((merchant) => {
    const merchantCategory = String(merchant?.category || 'OTHER')
    const merchantName = merchantDisplayName(merchant).toLowerCase()
    const merchantCode = String(merchant?.merchantCode || merchant?.code || '').toLowerCase()

    const matchesCategory = selectedCategory.value === 'ALL' || merchantCategory === selectedCategory.value
    const matchesQuery = !query || merchantName.includes(query) || merchantCode.includes(query)
    return matchesCategory && matchesQuery
  })
})

onMounted(() => {
  merchantStore.fetchMerchants()
})

function selectCategory(category) {
  selectedCategory.value = category
}

function selectMerchant(merchant) {
  selectedMerchant.value = merchant
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  selectedMerchant.value = null
  paymentForm.value = { amount: '', pin: '' }
  errors.value = {}
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol'
  }).format(Number(amount || 0))
}

async function handlePayment() {
  loading.value = true
  errors.value = {}

  if (!userStore.wallet?.id) {
    errors.value = { pin: 'Wallet is not available for this account yet. Please re-login and try again.' }
    loading.value = false
    return
  }

  const parsedAmount = parseFloat(paymentForm.value.amount)
  if (!parsedAmount || parsedAmount <= 0) {
    errors.value = { amount: 'Enter a valid amount greater than zero.' }
    loading.value = false
    return
  }

  if (parsedAmount > Number(userStore.balance || 0)) {
    errors.value = { general: 'Insufficient balance for this payment.', amount: 'Insufficient balance.' }
    loading.value = false
    return
  }

  if (!pinRegex.test(paymentForm.value.pin.trim())) {
    errors.value = { pin: 'PIN must be 4-6 digits.' }
    loading.value = false
    return
  }

  let optimisticReference = ''
  try {
    optimisticReference = `MRC-${Date.now()}`
    const optimisticTransaction = transactionStore.addLocalTransaction({
      transactionId: optimisticReference,
      referenceNumber: optimisticReference,
      description: `Payment to ${merchantDisplayName(selectedMerchant.value)}`,
      status: 'PENDING',
      amount: parsedAmount,
      type: 'debit',
      timestamp: new Date().toISOString(),
      merchantName: merchantDisplayName(selectedMerchant.value),
      merchantCode: selectedMerchant.value?.merchantCode
    })

    const paymentData = {
      fromWalletId: userStore.wallet.id,
      merchantCode: selectedMerchant.value.merchantCode,
      amount: parsedAmount,
      pin: paymentForm.value.pin
    }

    const paymentResponse = await transactionStore.createMerchantPayment(paymentData)

    const reference =
      paymentResponse?.data?.referenceNumber ||
      paymentResponse?.referenceNumber ||
      paymentResponse?.data?.transactionId ||
      paymentResponse?.transactionId ||
      optimisticReference
    const resolvedStatus = normalizeTransactionStatus(paymentResponse?.data ?? paymentResponse ?? { status: 'SUCCESSFUL' })
    const updatedTransaction = transactionStore.updateLocalTransaction(
      optimisticTransaction?.transactionId || optimisticReference,
      {
        transactionId: paymentResponse?.data?.transactionId || paymentResponse?.transactionId || reference,
        referenceNumber: reference,
        status: resolvedStatus,
        timestamp: paymentResponse?.data?.timestamp || paymentResponse?.timestamp || new Date().toISOString()
      }
    )

    if (updatedTransaction?.status === 'SUCCESSFUL') {
      userStore.setWallet({
        ...userStore.wallet,
        balance: userStore.balance - parsedAmount
      })
    }

    paymentReceipt.value = {
      merchantName: merchantDisplayName(selectedMerchant.value),
      amount: formatCurrency(parsedAmount),
      reference,
      status: updatedTransaction?.status || resolvedStatus
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

    closePaymentModal()
    showReceiptModal.value = true
    toastStore.success('Payment request submitted successfully.')
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
</script>

