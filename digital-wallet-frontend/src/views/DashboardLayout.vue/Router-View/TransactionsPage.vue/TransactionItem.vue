<template>
  <div class="flex items-center justify-between border-b p-4" @click="$emit('click')">
    <div class="flex items-center">
      <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <span class="text-primary-600">{{ icon }}</span>
      </div>
      <div>
        <p class="font-semibold">{{ transaction.description }}</p>
        <p class="text-sm text-gray-500">{{ formattedDate }}</p>
        <p class="text-xs text-gray-500">{{ counterpartyLabel }}: {{ counterpartyValue }}</p>
      </div>
    </div>
    <p :class="['font-bold', amountClass]">NGN {{ formattedAmount }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  transaction: { type: Object, required: true }
})
const userStore = useUserStore()

const normalizeToken = (value) =>
  String(value || '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_')

const currentUsername = computed(() =>
  normalizeToken(userStore.currentUser?.username || userStore.currentUser?.userName)
)
const currentWalletId = computed(() =>
  String(userStore.wallet?.id || userStore.currentUser?.wallet?.id || '')
)

const isDebitForCurrentUser = computed(() => {
  const typeToken = normalizeToken(props.transaction.type || props.transaction.transactionType || props.transaction.direction)
  const fromUsername = normalizeToken(props.transaction.fromUsername || props.transaction.senderUsername || props.transaction.sourceUsername)
  const toUsername = normalizeToken(props.transaction.toUsername || props.transaction.recipientUsername || props.transaction.destinationUsername)
  const fromWalletId = String(props.transaction.fromWalletId || props.transaction.sourceWalletId || '')
  const toWalletId = String(props.transaction.toWalletId || props.transaction.destinationWalletId || '')

  if (['debit', 'sent', 'outgoing', 'withdrawal', 'merchant_payment', 'payment'].includes(typeToken)) return true
  if (['credit', 'received', 'incoming', 'deposit', 'topup', 'add_money', 'refund'].includes(typeToken)) return false

  if (currentUsername.value) {
    if (fromUsername && fromUsername === currentUsername.value) return true
    if (toUsername && toUsername === currentUsername.value) return false
  }
  if (currentWalletId.value) {
    if (fromWalletId && fromWalletId === currentWalletId.value) return true
    if (toWalletId && toWalletId === currentWalletId.value) return false
  }

  return Number(props.transaction.amount || 0) < 0
})

const normalizedType = computed(() => (isDebitForCurrentUser.value ? 'debit' : 'credit'))
const icon = computed(() => (normalizedType.value === 'credit' ? '+' : '-'))
const normalizedDescription = computed(() =>
  normalizeToken(props.transaction.description || props.transaction.narration || props.transaction.remark)
)

const formattedDate = computed(() => {
  const value = props.transaction.date || props.transaction.timestamp || props.transaction.createdAt
  if (!value) return 'N/A'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString()
})

const formattedAmount = computed(() =>
  Math.abs(Number(props.transaction.amount || 0)).toLocaleString()
)

const amountClass = computed(() =>
  normalizedType.value === 'credit' ? 'text-green-600' : 'text-red-600'
)

const userRecipient = computed(() =>
  props.transaction.toUsername ||
  props.transaction.recipientUsername ||
  props.transaction.destinationUsername ||
  props.transaction.toWalletId ||
  props.transaction.destinationWalletId ||
  null
)

const userSender = computed(() =>
  props.transaction.fromUsername ||
  props.transaction.senderUsername ||
  props.transaction.sourceUsername ||
  props.transaction.fromWalletId ||
  props.transaction.sourceWalletId ||
  null
)

const merchantCounterparty = computed(() =>
  props.transaction.merchantName ||
  props.transaction.merchantCode ||
  props.transaction.merchantId ||
  null
)

const isMerchantTransaction = computed(() =>
  normalizeToken(props.transaction.type || props.transaction.transactionType || props.transaction.direction) === 'merchant_payment' ||
  normalizedDescription.value.includes('merchant') ||
  normalizedDescription.value.includes('payment_to') ||
  (!userRecipient.value && Boolean(merchantCounterparty.value))
)

const counterpartyLabel = computed(() => {
  if (isMerchantTransaction.value) return 'Merchant'
  if (normalizedType.value === 'credit') return 'From User'
  return 'To User'
})

const counterpartyValue = computed(() => {
  if (isMerchantTransaction.value) return merchantCounterparty.value || 'N/A'
  if (normalizedType.value === 'credit') return userSender.value || 'N/A'
  return userRecipient.value || 'N/A'
})

defineEmits(['click'])
</script>
