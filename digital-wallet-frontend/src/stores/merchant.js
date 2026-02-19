import { defineStore } from 'pinia'
import { ref } from 'vue'
import merchantApi from '@/services/merchantApi'
import { handleApiError } from '@/utils/errorHandler'

export const useMerchantStore = defineStore('merchant', () => {
  const merchants = ref([])
  const categories = ref(['ALL', 'FOOD_AND_BEVERAGE', 'RETAIL', 'UTILITIES', 'ENTERTAINMENT', 'OTHER'])
  const selectedCategory = ref('ALL')
  const loading = ref(false)
  const error = ref('')

  function normalizeMerchantResponse(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data?.content)) return response.data.content
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.content)) return response.content
    return []
  }

  async function fetchMerchants() {
    loading.value = true
    error.value = ''
    try {
      const response = await merchantApi.getMerchants()
      merchants.value = normalizeMerchantResponse(response)
    } 
    catch (error) {
      const apiError = handleApiError(error)
      merchants.value = []
      error.value = apiError.message
    } 
    finally {
      loading.value = false
    }
  }

  async function fetchMerchantsByCategory(category) {
    loading.value = true
    error.value = ''
    try {
      const response = await merchantApi.getMerchantsByCategory(category)
      merchants.value = normalizeMerchantResponse(response)
    } 
    catch (error) {
      const apiError = handleApiError(error)
      merchants.value = []
      error.value = apiError.message
    } 
    finally {
      loading.value = false
    }
  }

  async function searchMerchants(query) {
    loading.value = true
    error.value = ''
    try {
      const response = await merchantApi.searchMerchants(query)
      merchants.value = normalizeMerchantResponse(response)
    } 
    catch (error) {
      const apiError = handleApiError(error)
      merchants.value = []
      error.value = apiError.message
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
    error,
    fetchMerchants,
    fetchMerchantsByCategory,
    searchMerchants
  }
})
