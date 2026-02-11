<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Pay Merchants</h1>
    
    <!-- Merchant Directory -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Merchant Directory</h3>
      
      <!-- Category Filter -->
      <div class="flex space-x-2 mb-4 overflow-x-auto">
        <button v-for="category in merchantStore.categories" :key="category" @click="selectCategory(category)" :class="selectedCategory === category ? 'btn-primary' : 'btn-secondary'" class="whitespace-nowrap">{{ category.replace('_', ' ') }}</button>
      </div>
      
      <!-- Merchants Grid -->
      <div v-if="merchantStore.loading" class="text-center py-8">
        <BaseLoader />
      </div>
      
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="merchant in merchantStore.merchants" :key="merchant.id" @click="selectMerchant(merchant)" class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import { useTransactionStore } from '@/stores/transaction'
import { useUserStore } from '@/stores/user'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'

const merchantStore = useMerchantStore()
const transactionStore = useTransactionStore()
const userStore = useUserStore()

const selectedCategory = ref('')
const selectedMerchant = ref(null)
const showPaymentModal = ref(false)
const paymentForm = ref({ amount: '', pin: '' })
const errors = ref({})
const loading = ref(false)

onMounted(() => {
  merchantStore.fetchMerchants()
})

function selectCategory(category) {
  selectedCategory.value = category
  if (category === 'ALL') {
    merchantStore.fetchMerchants()
  }
  else {
    merchantStore.fetchMerchantsByCategory(category)
  }
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
  
  try {
    const paymentData = {
      fromWalletId: userStore.wallet.id,
      merchantCode: selectedMerchant.value.merchantCode,
      amount: parseFloat(paymentForm.value.amount),
      pin: paymentForm.value.pin
    }
    
    await transactionStore.createMerchantPayment(paymentData)
    
    // Update balance
    userStore.setWallet({ 
      ...userStore.wallet, 
      balance: userStore.balance - parseFloat(paymentForm.value.amount) 
    })
    
    closePaymentModal()
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