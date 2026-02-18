<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Pay Merchants</h1>
    <BaseAlert v-if="errors.general || merchantStore.error" type="error" :message="errors.general || merchantStore.error" />
    
    <!-- Merchant Directory -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Merchant Directory</h3>

      <BaseInput
        v-model="searchQuery"
        label="Search Merchant"
        placeholder="Search by merchant name or code"
      />
      
      <!-- Category Filter -->
      <div class="flex space-x-2 mb-4 overflow-x-auto">
        <button v-for="category in merchantStore.categories" :key="category" @click="selectCategory(category)" :class="selectedCategory === category ? 'btn-primary' : 'btn-secondary'" class="whitespace-nowrap">{{ category.replace('_', ' ') }}</button>
      </div>
      
      <!-- Merchants Grid -->
      <div v-if="merchantStore.loading" class="text-center py-8">
        <BaseLoader />
      </div>
      
      <div v-else-if="filteredMerchants.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="merchant in filteredMerchants" :key="merchant.id" @click="selectMerchant(merchant)" class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-xl">🏪</span>
            </div>
            <div>
              <h4 class="font-medium">{{ merchant.merchantName }}</h4>
              <p class="text-sm text-gray-600">{{ merchant.category.replace('_', ' ') }}</p>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else message="No merchants available in this category." icon="🏪" />
    </BaseCard>
    
    <!-- Payment Modal -->
    <BaseModal :show="showPaymentModal" title="Pay Merchant" @close="closePaymentModal">
      <div v-if="selectedMerchant" class="space-y-4">
        <div class="text-center">
          <h4 class="text-lg font-semibold">{{ selectedMerchant.merchantName }}</h4>
          <p class="text-sm text-gray-600">{{ selectedMerchant.category.replace('_', ' ') }}</p>
        </div>
        <form @submit.prevent="handlePayment" class="space-y-4">
          <BaseInput v-model="paymentForm.amount" type="number" label="Amount" :error="errors.amount" placeholder="Enter amount"/>
          <BaseInput v-model="paymentForm.pin" type="password" label="PIN" :error="errors.pin" placeholder="4-digit PIN"/>
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
import { ref, onMounted, computed } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import { useTransactionStore } from '@/stores/transaction'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { handleApiError } from '@/utils/errorHandler'
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

const filteredMerchants = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return merchantStore.merchants.filter((merchant) => {
    const matchesCategory =
      selectedCategory.value === 'ALL' || merchant.category === selectedCategory.value
    const matchesQuery =
      !query ||
      merchant.merchantName?.toLowerCase().includes(query) ||
      merchant.merchantCode?.toLowerCase().includes(query)
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
  
  try {
    const paymentData = {
      fromWalletId: userStore.wallet.id,
      merchantCode: selectedMerchant.value.merchantCode,
      amount: parsedAmount,
      pin: paymentForm.value.pin
    }
    
    const paymentResponse = await transactionStore.createMerchantPayment(paymentData)
    
    // Update balance
    userStore.setWallet({ 
      ...userStore.wallet, 
      balance: userStore.balance - parsedAmount 
    })
    
    paymentReceipt.value = {
      merchantName: selectedMerchant.value.merchantName,
      amount: `₦${parsedAmount.toLocaleString()}`,
      reference:
        paymentResponse?.data?.referenceNumber ||
        paymentResponse?.referenceNumber ||
        paymentResponse?.data?.transactionId ||
        paymentResponse?.transactionId ||
        `MRC-${Date.now()}`,
      status: 'SUCCESS'
    }

    closePaymentModal()
    showReceiptModal.value = true
    toastStore.success('Payment request submitted successfully.')
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
</script>
