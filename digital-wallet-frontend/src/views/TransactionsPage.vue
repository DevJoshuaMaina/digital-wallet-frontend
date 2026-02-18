<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Transaction History</h1>
    <BaseAlert v-if="transactionStore.error" type="error" :message="transactionStore.error" />
    
    <!-- Filters -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Filters</h3>
      <div class="grid md:grid-cols-5 gap-4">
        <BaseInput v-model="filters.type" label="Type" placeholder="All types"/>
        <BaseInput v-model="filters.status" label="Status" placeholder="All statuses"/>
        <BaseInput v-model="filters.startDate" type="date" label="From Date"/>
        <BaseInput v-model="filters.endDate" type="date" label="To Date"/>
        <div class="flex items-end">
          <BaseButton @click="applyFilters" variant="primary">Apply Filters</BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <!-- Transactions List -->
    <BaseCard>
      <div v-if="transactionStore.loading" class="text-center py-8">
        <BaseLoader />
      </div>
      <EmptyState v-else-if="transactionStore.transactions.length === 0" message="No transactions found" icon="📭" />
      <div v-else>
        <TransactionItem v-for="transaction in transactionStore.transactions" :key="transaction.id" :transaction="transaction" @click="viewTransaction(transaction)"/>
        
        <!-- Pagination -->
        <div class="mt-6 flex justify-center">
          <BaseButton v-if="transactionStore.pagination.page > 0" @click="changePage(transactionStore.pagination.page - 1)" variant="secondary">Previous</BaseButton>
          <span class="mx-4 py-2">Page {{ transactionStore.pagination.page + 1 }} of {{ transactionStore.pagination.totalPages }}</span>
          <BaseButton v-if="!transactionStore.pagination.last" @click="changePage(transactionStore.pagination.page + 1)" variant="secondary">Next</BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <!-- Transaction Details Modal -->
    <BaseModal :show="showDetailsModal" title="Transaction Details" @close="closeDetailsModal">
      <div v-if="selectedTransaction" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Transaction ID</p>
            <p class="font-medium">{{ selectedTransaction.transactionId }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Reference</p>
            <p class="font-medium">{{ selectedTransaction.referenceNumber }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Amount</p>
            <p class="font-medium">₦{{ selectedTransaction.amount }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-medium">{{ selectedTransaction.status }}</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-600">Date</p>
          <p class="font-medium">{{ formatDate(selectedTransaction.timestamp) }}</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useUserStore } from '@/stores/user'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
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

onMounted(async () => {
  if (userStore.currentUser) {
    await transactionStore.fetchTransactions(userStore.currentUser.id)
  } else {
    transactionStore.error = 'User session not found. Please login again.'
  }
})

function applyFilters() {
  if (!userStore.currentUser?.id) return
  transactionStore.setFilters(filters.value)
  transactionStore.fetchTransactions(userStore.currentUser.id, filters.value)
}

function changePage(page) {
  if (!userStore.currentUser?.id) return
  transactionStore.pagination.page = page
  transactionStore.fetchTransactions(userStore.currentUser.id, filters.value)
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
  return new Date(dateString).toLocaleString()
}
</script> 
