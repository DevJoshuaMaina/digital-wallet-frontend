import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    getWalletByUser(userId) {
        return apiClient.get(API_ENDPOINTS.WALLET_BY_USER(userId))
    },

    getWalletById(walletId) {
        return apiClient.get(`${ API_ENDPOINTS.WALLETS }/${ walletId }`)
    },

    addMoney(walletId, data) {
        return apiClient.post(API_ENDPOINTS.ADD_MONEY(walletId), data)
    },

    setDailyLimit(walletId, limit) {
        return apiClient.put(`${ API_ENDPOINTS.WALLETS }/${ walletId}/limit`, { limit } )
    },

    normalizeWallet(response) {
        return response?.data || response?.wallet || response || null
    },

    async resolveWallet(user) {
        if (!user) return null

        const embeddedWallet = this.normalizeWallet(user.wallet)
        if (embeddedWallet?.id) return embeddedWallet

        const userId = user.id
        if (!userId) return embeddedWallet

        try {
            const byUser = await this.getWalletByUser(userId)
            const normalizedByUser = this.normalizeWallet(byUser)
            if (normalizedByUser?.id) return normalizedByUser
        }
        catch {
            // Try fallback lookup below.
        }

        // Some backend variants only support /wallets/{walletId}; only use known wallet-id candidates.
        const walletIdCandidates = [
            embeddedWallet?.id,
            user.walletId,
            user.defaultWalletId
        ].filter((candidate, index, all) => candidate && all.indexOf(candidate) === index)

        for (const walletId of walletIdCandidates) {
            try {
                const byId = await this.getWalletById(walletId)
                const normalizedById = this.normalizeWallet(byId)
                if (normalizedById?.id) return normalizedById
            }
            catch {
                // Continue trying other candidates.
            }
        }

        return embeddedWallet
    }
}
