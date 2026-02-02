import {defineStore} from 'pinia'
import {ref} from 'vue'
import transactionApi from '@services/transactionApi'

export const userTransactionStore = defineStore('transaction', () => {
    const transactions = ref([])
    const filters = ref({type: '', status: '', dateRange: ''})
    const pagination = ref({currentPage: 1, totalPages: 1})
    const loading = ref(false)

    async function fetchTransactions(userId, filters) {
        loading.value = true
        try {
            const response = await transactionApi.getTransactions(userId, filters)
            transactions.value = response.data
            pagination.value = response.pagination
        }
        catch (error){
            console.error('Error fetching transactions:', error)
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
        fetchTransactions,
        createTransfer,
        createMerchantPayment,
        setFilters
    }
})