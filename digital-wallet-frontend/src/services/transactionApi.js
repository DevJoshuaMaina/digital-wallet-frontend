import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    transfer(data) {
        return apiClient.post(API_ENDPOINTS.TRANSFER, data)
    },

    merchantPayment(data) {
        return apiClient.post(API_ENDPOINTS.MERCHANT_PAYMENT, data)
    },

    getTransactions(userId, params) {
        return apiClient.get(API_ENDPOINTS.USER_TRANSACTIONS(userId), { params })
    },

    getTransactions(userId, params) {
        return apiClient.get(API_ENDPOINTS.USER_TRANSACTIONS(userId), { params })
    },

    getTransactionsById(id) {
        return apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/${id}`)
    },

    getTransactionStats(userId, dateRange) {
        return apiClient.get(API_ENDPOINTS.TRANSACTION_STATS(userId, { params: { dateRange } }))
    }
}