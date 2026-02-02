import {defineStore} from 'pinia'
import {ref} from 'vue'
import merchantApi from '@/services/merchantApi'

export const useMerchantStore = defineStore('merchant', () => {
    const merchants = ref([])
    const categories = ref(['All', 'Food', 'Retail', 'Utilities'])
    const selectedCategory = ref('All')
    const loading = ref(false)

    async function fetchMerchants() {
        loading.value = true
        try {
            const response = await merchantApi.getMerchants()
            merchants.value = response
        }
        catch (error) {
            console.error('Error fetching merchants:', error)
        }
        finally {
            loading.value = false
        }
    }

     async function fetchMerchantsByCategory() {
        loading.value = true
        try {
            const response = await merchantApi.getMerchantsByCategory(category)
            merchants.value = response
        }
        catch (error) {
            console.error('Error fetching merchants by category:', error)
        }
        finally {
            loading.value = false
        }
    }

    async function searchMerchants(query) {
        loading.value = true
        try {
            const response = await merchantApi.searchMerchants(query)
            merchants.value = response
        }
        catch (error) {
            console.error('Error searching merchants:', error)
        }
        finally {
            loading.value = false
        }
    }

    return {
        merchants,
        categories,
        selectedCategory,
        loading,
        fetchMerchants,
        fetchMerchantsByCategory,
        searchMerchants
    }
})