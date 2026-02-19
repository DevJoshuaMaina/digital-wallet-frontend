import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"
import { normalizeTransactionResponse } from '@/utils/transactionNormalizer'

const unwrapEnvelope = (response) => {
    if (response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'success')) {
        if (response.success === false) {
            const error = new Error(response.message || 'Request failed.')
            error.response = {
                status: 400,
                data: response
            }
            throw error
        }
        return response.data ?? null
    }
    return response
}

const isMissingByIdError = (error) => {
    const status = error?.response?.status
    const message = String(error?.response?.data?.message || error?.message || '').toLowerCase()
    return status === 404 || message.includes('not found with id')
}

const isRetryableIdentifierError = (error) => {
    const status = error?.response?.status
    const message = String(error?.response?.data?.message || error?.message || '').toLowerCase()

    if (status === 401 || status === 403) {
        return false
    }

    if (isMissingByIdError(error)) {
        return true
    }

    return (
        status === 400 ||
        status === 404 ||
        status === 500 ||
        message.includes('unexpected error occurred') ||
        message.includes('invalid') ||
        message.includes('not found')
    )
}

const unique = (values) => values.filter((value, index) => value && values.indexOf(value) === index)

const extractTransactionList = (payload) => normalizeTransactionResponse(payload).normalizedList

const transactionKey = (transaction) =>
    String(
        transaction?.id ??
        transaction?.transactionId ??
        transaction?.referenceNumber ??
        transaction?.reference ??
        `${ transaction?.timestamp ?? transaction?.date ?? transaction?.createdAt ?? '' }|${ transaction?.amount ?? transaction?.transactionAmount ?? transaction?.value ?? '' }|${ transaction?.description ?? transaction?.narration ?? transaction?.remark ?? '' }`
    )

const mergeTransactionPayload = (collector, seen, payload) => {
    const list = extractTransactionList(payload)
    for (const transaction of list) {
        const key = transactionKey(transaction)
        if (!seen.has(key)) {
            seen.add(key)
            collector.push(transaction)
        }
    }
}

const hasStatsData = (payload) => {
    const source = payload?.data ?? payload ?? {}
    const transactionCount = Number(source.transactionCount ?? source.totalTransactions ?? source.count ?? 0)
    const totalSent = Number(source.totalSent ?? source.sent ?? source.totalDebit ?? source.debit ?? source.outgoing ?? 0)
    const totalReceived = Number(source.totalReceived ?? source.received ?? source.totalCredit ?? source.credit ?? source.incoming ?? 0)

    return transactionCount > 0 || totalSent > 0 || totalReceived > 0
}

const extractUserId = (userPayload) => {
    const user = userPayload?.data ?? userPayload ?? {}
    return user?.id ?? user?.userId ?? user?.data?.id ?? user?.data?.userId ?? null
}

const resolveUserIdByUsername = async (username) => {
    if (!username) return null
    try {
        const userResponse = await apiClient.get(API_ENDPOINTS.USER_BY_USERNAME(username))
        const unwrappedUser = unwrapEnvelope(userResponse)
        return extractUserId(unwrappedUser)
    }
    catch {
        return null
    }
}

const isEndpointFallbackError = (error) => {
    const status = error?.response?.status
    return status === 400 || status === 404 || status === 405
}

export default {
    async transfer(data) {
        const primaryPayload = {
            ...data,
            amount: Number(data?.amount ?? 0)
        }

        try {
            const response = await apiClient.post(API_ENDPOINTS.TRANSFER, primaryPayload)
            return unwrapEnvelope(response)
        }
        catch (error) {
            if (!isEndpointFallbackError(error)) {
                throw error
            }
        }

        const alternatePayload = {
            fromWalletId: primaryPayload.fromWalletId,
            senderWalletId: primaryPayload.fromWalletId,
            toWalletId: primaryPayload.toWalletId,
            recipientWalletId: primaryPayload.toWalletId,
            toUsername: primaryPayload.toUsername,
            recipientUsername: primaryPayload.toUsername,
            toUserId: primaryPayload.toUserId,
            recipientUserId: primaryPayload.toUserId,
            amount: primaryPayload.amount,
            pin: primaryPayload.pin
        }

        try {
            const response = await apiClient.post(`${ API_ENDPOINTS.TRANSACTIONS }/transfers`, alternatePayload)
            return unwrapEnvelope(response)
        }
        catch (error) {
            if (!isEndpointFallbackError(error)) {
                throw error
            }
        }

        const fallbackResponse = await apiClient.post(`${ API_ENDPOINTS.WALLETS }/transfer`, alternatePayload)
        return unwrapEnvelope(fallbackResponse)
    },

    async merchantPayment(data) {
        const response = await apiClient.post(API_ENDPOINTS.MERCHANT_PAYMENT, data)
        return unwrapEnvelope(response)
    },

    async getTransactions(userId, params = {}) {
        const normalizedParams = {
            ...params
        }
        const fallbackIdentifier = normalizedParams.userIdentifier || normalizedParams.username || normalizedParams.userName
        const walletId = normalizedParams.walletId
        delete normalizedParams.userIdentifier
        delete normalizedParams.username
        delete normalizedParams.userName
        delete normalizedParams.walletId

        if (normalizedParams.type) {
            const rawType = String(normalizedParams.type).trim().toUpperCase()
            const typeMap = {
                SENT: 'DEBIT',
                SEND: 'DEBIT',
                OUTGOING: 'DEBIT',
                RECEIVED: 'CREDIT',
                RECEIVE: 'CREDIT',
                INCOMING: 'CREDIT'
            }
            normalizedParams.type = typeMap[rawType] || rawType
        }
        if (normalizedParams.status) {
            const rawStatus = String(normalizedParams.status).trim().toUpperCase()
            const statusMap = {
                SUCCESS: 'SUCCESSFUL',
                COMPLETED: 'SUCCESSFUL',
                COMPLETE: 'SUCCESSFUL',
                FAILED: 'FAILURE'
            }
            normalizedParams.status = statusMap[rawStatus] || rawStatus
        }

        const startDate = normalizedParams.startDate || normalizedParams.fromDate
        const endDate = normalizedParams.endDate || normalizedParams.toDate
        if (startDate && endDate) {
            normalizedParams.dateRange = `${startDate},${endDate}`
            normalizedParams.fromDate = startDate
            normalizedParams.toDate = endDate
        }

        const cleanedParams = Object.fromEntries(
            Object.entries(normalizedParams).filter(([, value]) =>
                value !== null &&
                value !== undefined &&
                value !== ''
            )
        )
        const normalizedUsername = fallbackIdentifier ? String(fallbackIdentifier) : ''
        const normalizedWalletId = walletId ?? null
        const queryVariants = [cleanedParams]
        if (cleanedParams.page === 0) {
            queryVariants.push({ ...cleanedParams, page: 1 })
        }
        const isNumericIdentifier = !Number.isNaN(Number(userId))
        const usernameCandidate =
            fallbackIdentifier ||
            (isNumericIdentifier ? null : userId)
        const resolvedUserId =
            usernameCandidate
                ? await resolveUserIdByUsername(usernameCandidate)
                : null

        const identifiers = unique([resolvedUserId, userId, walletId, fallbackIdentifier])
        let lastSuccessfulResponse = null
        const collectedTransactions = []
        const seenTransactions = new Set()

        for (const identifier of identifiers) {
            for (const queryParams of queryVariants) {
                try {
                    const primary = await apiClient.get(API_ENDPOINTS.USER_TRANSACTIONS(identifier), { params: queryParams })
                    const unwrappedPrimary = unwrapEnvelope(primary)
                    lastSuccessfulResponse = unwrappedPrimary
                    mergeTransactionPayload(collectedTransactions, seenTransactions, unwrappedPrimary)
                }
                catch (error) {
                    if (!isRetryableIdentifierError(error)) {
                        throw error
                    }
                }

                try {
                    const fallback = await apiClient.get(API_ENDPOINTS.TRANSACTIONS, {
                        params: {
                            userId: identifier,
                            walletId: normalizedWalletId,
                            username: normalizedUsername,
                            ...queryParams
                        }
                    })
                    const unwrappedFallback = unwrapEnvelope(fallback)
                    lastSuccessfulResponse = unwrappedFallback
                    mergeTransactionPayload(collectedTransactions, seenTransactions, unwrappedFallback)
                }
                catch (error) {
                    if (!isRetryableIdentifierError(error)) {
                        throw error
                    }
                }

                try {
                    const walletFallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/wallet/${ identifier }`, { params: queryParams })
                    const unwrappedWalletFallback = unwrapEnvelope(walletFallback)
                    lastSuccessfulResponse = unwrappedWalletFallback
                    mergeTransactionPayload(collectedTransactions, seenTransactions, unwrappedWalletFallback)
                }
                catch (error) {
                    if (!isRetryableIdentifierError(error)) {
                        throw error
                    }
                }

                try {
                    const usernameFallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/username/${ identifier }`, { params: queryParams })
                    const unwrappedUsernameFallback = unwrapEnvelope(usernameFallback)
                    lastSuccessfulResponse = unwrappedUsernameFallback
                    mergeTransactionPayload(collectedTransactions, seenTransactions, unwrappedUsernameFallback)
                }
                catch (error) {
                    if (!isRetryableIdentifierError(error)) {
                        throw error
                    }
                }
            }
        }

        for (const queryParams of queryVariants) {
            try {
                const genericFallback = await apiClient.get(API_ENDPOINTS.TRANSACTIONS, {
                    params: {
                        username: normalizedUsername || undefined,
                        walletId: normalizedWalletId || undefined,
                        ...queryParams
                    }
                })
                const unwrappedGenericFallback = unwrapEnvelope(genericFallback)
                lastSuccessfulResponse = unwrappedGenericFallback
                mergeTransactionPayload(collectedTransactions, seenTransactions, unwrappedGenericFallback)
            }
            catch (error) {
                if (!isRetryableIdentifierError(error)) {
                    throw error
                }
            }
        }

        if (collectedTransactions.length > 0) {
            return {
                content: collectedTransactions,
                page: Number(cleanedParams.page ?? 0),
                totalPages: Number(cleanedParams.totalPages ?? 1),
                last: true
            }
        }

        return lastSuccessfulResponse || []
    },

    async getTransactionsById(id) {
        const response = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/${ id }`)
        return unwrapEnvelope(response)
    },

    async getTransactionStats(userId, dateRange, fallbackIdentifier, walletId) {
        const params = dateRange ? { dateRange } : {}
        const isNumericIdentifier = !Number.isNaN(Number(userId))
        const usernameCandidate =
            fallbackIdentifier ||
            (isNumericIdentifier ? null : userId)
        const resolvedUserId =
            usernameCandidate
                ? await resolveUserIdByUsername(usernameCandidate)
                : null
        const identifiers = unique([resolvedUserId, userId, walletId, fallbackIdentifier])
        let lastSuccessfulResponse = null

        for (const identifier of identifiers) {
            try {
                const primary = await apiClient.get(API_ENDPOINTS.TRANSACTION_STATS(identifier), { params })
                const unwrappedPrimary = unwrapEnvelope(primary)
                lastSuccessfulResponse = unwrappedPrimary
                if (hasStatsData(unwrappedPrimary)) return unwrappedPrimary
            }
            catch (error) {
                if (!isRetryableIdentifierError(error)) {
                    throw error
                }
            }

            try {
                const fallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/stats`, {
                    params: {
                        userId: identifier,
                        username: fallbackIdentifier,
                        walletId,
                        ...params
                    }
                })
                const unwrappedFallback = unwrapEnvelope(fallback)
                lastSuccessfulResponse = unwrappedFallback
                if (hasStatsData(unwrappedFallback)) return unwrappedFallback
            }
            catch (error) {
                if (!isRetryableIdentifierError(error)) {
                    throw error
                }
            }

            try {
                const walletFallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/wallet/${ identifier }/stats`, { params })
                const unwrappedWalletFallback = unwrapEnvelope(walletFallback)
                lastSuccessfulResponse = unwrappedWalletFallback
                if (hasStatsData(unwrappedWalletFallback)) return unwrappedWalletFallback
            }
            catch (error) {
                if (!isRetryableIdentifierError(error)) {
                    throw error
                }
            }

            try {
                const usernameFallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/username/${ identifier }/stats`, { params })
                const unwrappedUsernameFallback = unwrapEnvelope(usernameFallback)
                lastSuccessfulResponse = unwrappedUsernameFallback
                if (hasStatsData(unwrappedUsernameFallback)) return unwrappedUsernameFallback
            }
            catch (error) {
                if (!isRetryableIdentifierError(error)) {
                    throw error
                }
            }
        }

        try {
            const genericStatsFallback = await apiClient.get(`${ API_ENDPOINTS.TRANSACTIONS }/stats`, {
                params: {
                    username: fallbackIdentifier,
                    walletId,
                    ...params
                }
            })
            const unwrappedGenericStatsFallback = unwrapEnvelope(genericStatsFallback)
            lastSuccessfulResponse = unwrappedGenericStatsFallback
            if (hasStatsData(unwrappedGenericStatsFallback)) return unwrappedGenericStatsFallback
        }
        catch (error) {
            if (!isRetryableIdentifierError(error)) {
                throw error
            }
        }

        return lastSuccessfulResponse || {}
    }
}
