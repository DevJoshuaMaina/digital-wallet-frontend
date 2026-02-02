import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    getWalletByUser(userId) {
        return apiClient.get(API_ENDPOINTS.WALLET_BY_USER(userId))
    },

    addMoney(walletId, data) {
        return apiClient.post(API_ENDPOINTS.ADD_MONEY(walletId), data)
    },

    setDailyLimit(walletId, limit) {
        return apiClient.put(`${API_ENDPOINTS.WALLETS}/${walletId}/limit`, { limit })
    }
}