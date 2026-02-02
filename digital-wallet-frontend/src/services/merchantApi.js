import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    getMerchants() {
        return apiClient.get(API_ENDPOINTS.MERCHANTS)
    },

    getMerchantsByCategory(category) {
        return apiClient.get(`${API_ENDPOINTS.MERCHANTS}/category/${category}`)
    },

    searchMerchants(query) {
        return apiClient.get(`${API_ENDPOINTS.MERCHANTS}/search`, { params: { query } })
    },

    getMerchantByCode(code) {
        return apiClient.get(API_ENDPOINTS.MERCHANT_BY_CODE(code))
    }
}