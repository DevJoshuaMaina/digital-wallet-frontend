<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Transaction History</h1>
    <BaseAlert v-if="transactionStore.error" type="error" :message="transactionStore.error" />

    <BaseCard>
      <h3 class="mb-4 text-lg font-semibold">Filters</h3>
      <div class="grid gap-4 md:grid-cols-5">
        <BaseSelect v-model="filters.type" label="Type" :options="typeOptions" />
        <BaseSelect v-model="filters.status" label="Status" :options="statusOptions" />
        <BaseInput v-model="filters.startDate" type="date" label="From Date" />
        <BaseInput v-model="filters.endDate" type="date" label="To Date" />
        <div class="flex items-end">
          <BaseButton @click="applyFilters" variant="primary">Apply Filters</BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="transactionStore.loading" class="py-8 text-center">
        <BaseLoader />
      </div>
      <EmptyState v-else-if="transactionStore.transactions.length === 0" message="No transactions found" icon="H" />
      <div v-else>
        <TransactionItem
          v-for="transaction in transactionStore.transactions"
          :key="transaction.id"
          :transaction="transaction"
          @click="viewTransaction(transaction)"
        />

        <div class="mt-6 flex justify-center">
          <BaseButton
            v-if="transactionStore.pagination.page > 0"
            @click="changePage(transactionStore.pagination.page - 1)"
            variant="secondary"
          >
            Previous
          </BaseButton>
          <span class="mx-4 py-2">Page {{ transactionStore.pagination.page + 1 }} of {{ transactionStore.pagination.totalPages }}</span>
          <BaseButton
            v-if="!transactionStore.pagination.last"
            @click="changePage(transactionStore.pagination.page + 1)"
            variant="secondary"
          >
            Next
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseModal :show="showDetailsModal" title="Transaction Details" @close="closeDetailsModal">
      <div v-if="selectedTransaction" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Transaction ID</p>
            <p class="font-medium">{{ selectedTransaction.transactionId || selectedTransaction.id || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Reference</p>
            <p class="font-medium">{{ selectedTransaction.referenceNumber || selectedTransaction.reference || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Amount</p>
            <p class="font-medium">NGN {{ formatAmount(selectedTransaction.amount) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-medium">{{ selectedTransaction.status || 'UNKNOWN' }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2">
          <div>
            <p class="text-sm text-gray-600">Type</p>
            <p class="font-medium">{{ String(selectedTransaction.type || 'UNKNOWN').toUpperCase() }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Description</p>
            <p class="font-medium">{{ selectedTransaction.description || selectedTransaction.narration || selectedTransaction.remark || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Sent To</p>
            <p class="font-medium">{{ getSentTo(selectedTransaction) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Received From</p>
            <p class="font-medium">{{ getReceivedFrom(selectedTransaction) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Merchant</p>
            <p class="font-medium">{{ getMerchant(selectedTransaction) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Counterparty</p>
            <p class="font-medium">{{ getCounterparty(selectedTransaction) }}</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-600">Date</p>
          <p class="font-medium">{{ formatDate(selectedTransaction.timestamp || selectedTransaction.date || selectedTransaction.createdAt) }}</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useUserStore } from '@/stores/user'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import EmptyState from '@/components/EmptyState.vue'
import TransactionItem from '@/views/DashboardLayout.vue/Router-View/TransactionsPage.vue/TransactionItem.vue'

const transactionStore = useTransactionStore()
const userStore = useUserStore()

const filters = ref({ type: '', status: '', startDate: '', endDate: '' })
const selectedTransaction = ref(null)
const showDetailsModal = ref(false)
const pageSize = 10
const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Sent', value: 'debit' },
  { label: 'Received', value: 'credit' }
]
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Successful', value: 'SUCCESS' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Pending', value: 'PENDING' }
]

const getCurrentUserIdentifier = () =>
  userStore.currentUser?.id ||
  userStore.currentUser?.userId ||
  userStore.currentUser?.user?.id ||
  userStore.currentUser?.username ||
  userStore.currentUser?.userName ||
  userStore.wallet?.id ||
  userStore.currentUser?.wallet?.id ||
  null

const fetchTransactionsForCurrentUser = async (page = 0) => {
  const identifier = getCurrentUserIdentifier()
  if (!identifier) {
    transactionStore.error = 'User session not found. Please login again.'
    return
  }

  await transactionStore.fetchTransactions(identifier, {
    ...filters.value,
    page,
    size: pageSize,
    username: userStore.currentUser?.username || userStore.currentUser?.userName,
    walletId: userStore.currentUser?.wallet?.id || userStore.wallet?.id
  })
}

watch(
  () =>
    [
      userStore.currentUser?.id,
      userStore.currentUser?.userId,
      userStore.currentUser?.user?.id,
      userStore.currentUser?.username,
      userStore.currentUser?.userName,
      userStore.wallet?.id,
      userStore.currentUser?.wallet?.id
    ].join('|'),
  () => {
    fetchTransactionsForCurrentUser(0)
  },
  { immediate: true }
)

function applyFilters() {
  transactionStore.pagination.page = 0
  transactionStore.setFilters(filters.value)
  fetchTransactionsForCurrentUser(0)
}

function changePage(page) {
  transactionStore.pagination.page = page
  fetchTransactionsForCurrentUser(page)
}

function viewTransaction(transaction) {
  selectedTransaction.value = transaction
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedTransaction.value = null
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const parsed = new Date(dateString)
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString()
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-NG')
}

function normalizeToken(value) {
  return String(value || '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_')
}

function isDebit(transaction) {
  const token = normalizeToken(transaction.type || transaction.transactionType || transaction.direction)
  const currentUsername = normalizeToken(userStore.currentUser?.username || userStore.currentUser?.userName)
  const currentWalletId = String(userStore.wallet?.id || userStore.currentUser?.wallet?.id || '')
  const fromUsername = normalizeToken(transaction.fromUsername || transaction.senderUsername || transaction.sourceUsername)
  const toUsername = normalizeToken(transaction.toUsername || transaction.recipientUsername || transaction.destinationUsername)
  const fromWalletId = String(transaction.fromWalletId || transaction.sourceWalletId || '')
  const toWalletId = String(transaction.toWalletId || transaction.destinationWalletId || '')

  if (['debit', 'sent', 'outgoing', 'transfer', 'merchant_payment', 'payment', 'withdrawal'].includes(token)) {
    return true
  }
  if (['credit', 'received', 'incoming', 'deposit', 'refund', 'topup', 'add_money'].includes(token)) {
    return false
  }

  if (currentUsername) {
    if (fromUsername && fromUsername === currentUsername) return true
    if (toUsername && toUsername === currentUsername) return false
  }
  if (currentWalletId) {
    if (fromWalletId && fromWalletId === currentWalletId) return true
    if (toWalletId && toWalletId === currentWalletId) return false
  }

  return Number(transaction.amount || 0) < 0
}

function isMerchantTransaction(transaction) {
  const token = normalizeToken(transaction.type || transaction.transactionType || transaction.direction)
  const description = normalizeToken(transaction.description || transaction.narration || transaction.remark)
  const hasMerchantField = Boolean(transaction.merchantName || transaction.merchantCode || transaction.merchantId)
  const hasUserRecipient = Boolean(
    transaction.toUsername ||
    transaction.recipientUsername ||
    transaction.destinationUsername ||
    transaction.toWalletId ||
    transaction.destinationWalletId
  )

  return token === 'merchant_payment' ||
    description.includes('merchant') ||
    description.includes('payment_to') ||
    (hasMerchantField && !hasUserRecipient)
}

function getSentTo(transaction) {
  if (!isDebit(transaction)) return 'N/A'
  if (isMerchantTransaction(transaction)) return 'N/A'
  return (
    transaction.toUsername ||
    transaction.recipientUsername ||
    transaction.destinationUsername ||
    transaction.toWalletId ||
    transaction.destinationWalletId ||
    'N/A'
  )
}

function getReceivedFrom(transaction) {
  if (isDebit(transaction)) return 'N/A'
  return (
    transaction.fromUsername ||
    transaction.senderUsername ||
    transaction.sourceUsername ||
    transaction.fromWalletId ||
    transaction.sourceWalletId ||
    'N/A'
  )
}

function getMerchant(transaction) {
  if (!isMerchantTransaction(transaction)) return 'N/A'
  return (
    transaction.merchantName ||
    transaction.merchantCode ||
    transaction.merchantId ||
    'N/A'
  )
}

function getCounterparty(transaction) {
  return (
    getSentTo(transaction) !== 'N/A' ? getSentTo(transaction) :
    getReceivedFrom(transaction) !== 'N/A' ? getReceivedFrom(transaction) :
    transaction.toUsername ||
    transaction.fromUsername ||
    transaction.recipientUsername ||
    transaction.senderUsername ||
    transaction.merchantName ||
    transaction.merchantCode ||
    'N/A'
  )
}
</script>
