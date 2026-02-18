import { defineStore } from 'pinia'
import { ref } from 'vue'
import transactionApi from '@/services/transactionApi'
import { handleApiError } from '@/utils/errorHandler'

export const useTransactionStore = defineStore('transaction', () => {
    const transactions = ref([])
    const filters = ref({ type: '', status: '', dateRange: '' })
    const pagination = ref({ page: 0, totalPages: 1, last: true })
    const loading = ref(false)
    const error = ref('')

    function normalizeTransactionResponse(response) {
        const payload = response?.data ?? response
        const list = payload?.content ?? payload?.data ?? payload
        const normalizedList = Array.isArray(list) ? list : []
        const normalizedPagination = {
            page: payload?.page ?? response?.pagination?.page ?? 0,
            totalPages: payload?.totalPages ?? response?.pagination?.totalPages ?? 1,
            last: payload?.last ?? response?.pagination?.last ?? true
        }
        return { normalizedList, normalizedPagination }
    }

    async function fetchTransactions(userId, filters) {
        loading.value = true
        error.value = ''
        try {
            const response = await transactionApi.getTransactions(userId, filters)
            const { normalizedList, normalizedPagination } = normalizeTransactionResponse(response)
            transactions.value = normalizedList
            pagination.value = normalizedPagination
        }
        catch (error){
            const apiError = handleApiError(error)
            transactions.value = []
            error.value = apiError.message
        }
        finally{
            loading.value = false
        }
    }

    async function createTransfer(data) {
        try {
            const response = await transactionApi.transfer(data)
            return response
        }
        catch (error) {
            throw error
        }
    }

    async function createMerchantPayment(data) {
        try{
            const response = await transactionApi.merchantPayment(data)
            return response
        }
        catch (error) {
            throw error
        }
    }

    function setFilters(newFilters) {
        filters.value = newFilters
    }

    return {
        transactions,
        filters,
        pagination,
        loading,
        error,
        fetchTransactions,
        createTransfer,
        createMerchantPayment,
        setFilters
    }
})
