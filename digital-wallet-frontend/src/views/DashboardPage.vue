<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Welcome back, {{ userStore.userName }}</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <WalletCard :wallet="userStore.wallet" @add-money="showAddMoney" @transfer="goToTransfer" />
      <div class="grid grid-cols-2 gap-4">
        <QuickActionButton icon="+" label="Add Money" color="green" @click="showAddMoney" />
        <QuickActionButton icon=">" label="Send Money" color="blue" @click="goToTransfer" />
        <QuickActionButton icon="M" label="Pay Merchant" color="purple" @click="goToMerchants" />
        <QuickActionButton icon="R" label="Request Money" color="orange" @click="goToRequest" />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentTransactions />
      <StatsChart />
    </div>
    <BaseModal :show="showRequestModal" title="Request Money" @close="showRequestModal = false">
      <form class="space-y-4" @submit.prevent="createRequestMessage">
        <BaseInput
          v-model="requestForm.fromUsername"
          label="Request From"
          placeholder="Enter username to request from"
          :error="requestFromError"
        />
        <BaseInput
          :model-value="currentUsername"
          label="Send To"
          placeholder="Your username"
          disabled
        />
        <BaseInput
          v-model="requestForm.amount"
          type="number"
          label="Amount"
          placeholder="Enter requested amount"
          :error="requestError"
        />
        <BaseInput
          v-model="requestForm.note"
          label="Note (optional)"
          placeholder="What is this request for?"
        />
        <div class="flex gap-2">
          <BaseButton type="submit" :loading="requestLoading">Generate Request</BaseButton>
          <BaseButton type="button" variant="secondary" @click="showRequestModal = false">Close</BaseButton>
        </div>
      </form>
      <div v-if="requestMessage" class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
        <p class="mb-2 font-medium">Share this request:</p>
        <p>{{ requestMessage }}</p>
        <BaseButton type="button" class="mt-3" @click="copyRequestMessage">Copy Message</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useRequestStore } from '@/stores/request'
import WalletCard from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/WalletCard.vue'
import QuickActionButton from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/QuickActions.vue'
import RecentTransactions from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/RecentTransactions.vue'
import StatsChart from '@/views/DashboardLayout.vue/Router-View/DashboardPage.vue/StatsChart.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()
const requestStore = useRequestStore()
const showRequestModal = ref(false)
const requestForm = ref({ fromUsername: '', amount: '', note: '' })
const requestError = ref('')
const requestFromError = ref('')
const requestMessage = ref('')
const requestLoading = ref(false)

const currentUsername = computed(() =>
  userStore.currentUser?.username || userStore.currentUser?.userName || 'your-username'
)

const showAddMoney = () => {
  router.push('/wallet')
}

const goToTransfer = () => {
  router.push('/transfer')
}

const goToMerchants = () => {
  router.push('/merchants')
}

const goToRequest = () => {
  showRequestModal.value = true
  requestError.value = ''
  requestFromError.value = ''
  requestMessage.value = ''
  requestForm.value = {
    ...requestForm.value,
    fromUsername: '',
    amount: '',
    note: ''
  }
}

const createRequestMessage = async () => {
  requestError.value = ''
  requestFromError.value = ''
  requestMessage.value = ''
  const fromUsername = String(requestForm.value.fromUsername || '').trim().replace('@', '')

  if (!fromUsername) {
    requestFromError.value = 'Enter who you want to request money from.'
    return
  }
  if (fromUsername.toLowerCase() === currentUsername.value.toLowerCase()) {
    requestFromError.value = 'You cannot request money from your own username.'
    return
  }

  const amount = Number(requestForm.value.amount)
  if (!amount || amount <= 0) {
    requestError.value = 'Enter a valid amount greater than zero.'
    return
  }

  const amountLabel = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol'
  }).format(amount)

  const note = requestForm.value.note?.trim()
  requestLoading.value = true
  try {
    await requestStore.createRequest({
      requesterUsername: currentUsername.value,
      requestedFromUsername: fromUsername,
      amount,
      note: note || ''
    })
  }
  catch {
    requestError.value = 'Unable to save request right now. Please try again.'
    requestLoading.value = false
    return
  }
  finally {
    requestLoading.value = false
  }

  requestMessage.value = note
    ? `Hi @${fromUsername}, please send ${amountLabel} to @${currentUsername.value}. Note: ${note}`
    : `Hi @${fromUsername}, please send ${amountLabel} to @${currentUsername.value}.`
  toastStore.success('Request created successfully.')
}

const copyRequestMessage = async () => {
  if (!requestMessage.value) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(requestMessage.value)
      toastStore.success('Request message copied.')
    }
    else {
      toastStore.info('Copy not supported on this browser. Please copy manually.')
    }
  }
  catch {
    toastStore.error('Unable to copy request message.')
  }
}
</script>
