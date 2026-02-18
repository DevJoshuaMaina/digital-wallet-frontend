import { defineStore } from 'pinia'
import { ref } from 'vue'
import transactionApi from '@/services/transactionApi'
import { handleApiError } from '@/utils/errorHandler'
import { normalizeTransactionItem, normalizeTransactionResponse, normalizeTransactionStatus } from '@/utils/transactionNormalizer'
import { useUserStore } from '@/stores/user'

export const useTransactionStore = defineStore('transaction', () => {
    const userStore = useUserStore()
    const transactions = ref([])
    const allTransactions = ref([])
    const filters = ref({ type: '', status: '', dateRange: '' })
    const pagination = ref({ page: 0, totalPages: 1, last: true, totalItems: 0 })
    const pageSize = ref(10)
    const loading = ref(false)
    const error = ref('')
    const activeOwnerKey = ref('')
    const latestFetchRequestId = ref(0)
    const LOCAL_TX_PREFIX = 'wallet_tx_cache_v1'

    function normalizeFilterType(type) {
        const token = String(type || '').trim().toLowerCase()
        if (!token) return ''
        if (['sent', 'send', 'outgoing', 'debit'].includes(token)) return 'debit'
        if (['received', 'receive', 'incoming', 'credit'].includes(token)) return 'credit'
        return token
    }

    function normalizeTransactionTypeToken(type) {
        const token = String(type || '').trim().toLowerCase()
        if (!token) return ''
        if (['debit', 'sent', 'send', 'outgoing', 'transfer', 'merchant_payment', 'payment', 'withdrawal'].includes(token)) {
            return 'debit'
        }
        if (['credit', 'received', 'receive', 'incoming', 'deposit', 'topup', 'add_money', 'refund'].includes(token)) {
            return 'credit'
        }
        if (token.includes('debit') || token.includes('sent') || token.includes('outgoing') || token.includes('withdraw')) {
            return 'debit'
        }
        if (token.includes('credit') || token.includes('receive') || token.includes('incoming') || token.includes('deposit')) {
            return 'credit'
        }
        return token
    }

    function inferTransactionTypeForCurrentUser(transaction) {
        const currentUserId = String(
            userStore.currentUser?.id ??
            userStore.currentUser?.userId ??
            userStore.currentUser?.user?.id ??
            ''
        )
        const currentUsername = normalizeToken(userStore.currentUser?.username || userStore.currentUser?.userName)
        const currentWalletId = String(userStore.wallet?.id ?? userStore.currentUser?.wallet?.id ?? '')

        const fromUserId = String(
            transaction.fromUserId ??
            transaction.senderUserId ??
            transaction.sourceUserId ??
            transaction.senderId ??
            ''
        )
        const toUserId = String(
            transaction.toUserId ??
            transaction.recipientUserId ??
            transaction.destinationUserId ??
            transaction.receiverId ??
            ''
        )
        const fromUsername = normalizeToken(
            transaction.fromUsername ??
            transaction.senderUsername ??
            transaction.sourceUsername ??
            transaction.sender ??
            transaction.fromUserName
        )
        const toUsername = normalizeToken(
            transaction.toUsername ??
            transaction.recipientUsername ??
            transaction.destinationUsername ??
            transaction.receiver ??
            transaction.beneficiaryUsername ??
            transaction.toUserName
        )
        const fromWalletId = String(
            transaction.fromWalletId ??
            transaction.sourceWalletId ??
            transaction.senderWalletId ??
            ''
        )
        const toWalletId = String(
            transaction.toWalletId ??
            transaction.destinationWalletId ??
            transaction.receiverWalletId ??
            transaction.beneficiaryWalletId ??
            ''
        )

        const matchesFrom = (
            (currentUserId && fromUserId === currentUserId) ||
            (currentUsername && fromUsername === currentUsername) ||
            (currentWalletId && fromWalletId === currentWalletId)
        )
        const matchesTo = (
            (currentUserId && toUserId === currentUserId) ||
            (currentUsername && toUsername === currentUsername) ||
            (currentWalletId && toWalletId === currentWalletId)
        )

        if (matchesFrom && !matchesTo) return 'debit'
        if (matchesTo && !matchesFrom) return 'credit'

        const token = normalizeTransactionTypeToken(
            transaction.type || transaction.transactionType || transaction.direction
        )
        if (token === 'debit' || token === 'credit') return token

        const description = normalizeToken(transaction.description || transaction.narration || transaction.remark)
        if (description.includes('sent') || description.includes('transfer_to') || description.includes('payment_to')) return 'debit'
        if (description.includes('received') || description.includes('from_')) return 'credit'

        return Number(transaction.amount || 0) < 0 ? 'debit' : 'credit'
    }

    function normalizeStatusToken(status) {
        const token = String(status || '').trim().toLowerCase()
        if (!token) return ''
        if (['success', 'successful', 'completed', 'complete'].includes(token)) return 'successful'
        if (['failed', 'failure', 'unsuccessful', 'declined', 'rejected', 'error'].includes(token)) return 'failure'
        if (['pending', 'processing', 'in_progress', 'queued'].includes(token)) return 'pending'
        return token
    }

    function matchesDateRange(transaction, startDate, endDate) {
        if (!startDate && !endDate) return true
        const sourceDate = transaction.timestamp || transaction.date || transaction.createdAt
        if (!sourceDate) return false
        const parsed = new Date(sourceDate)
        if (Number.isNaN(parsed.getTime())) return false
        const day = parsed.toISOString().slice(0, 10)
        if (startDate && day < startDate) return false
        if (endDate && day > endDate) return false
        return true
    }

    function applyClientFilters(list, requestFilters = {}) {
        const typeFilter = normalizeFilterType(requestFilters.type)
        const statusFilter = normalizeStatusToken(requestFilters.status)
        const startDate = requestFilters.startDate || requestFilters.fromDate || ''
        const endDate = requestFilters.endDate || requestFilters.toDate || ''

        return list.filter((transaction) => {
            const transactionType = inferTransactionTypeForCurrentUser(transaction)
            const transactionStatus = normalizeStatusToken(transaction.status)

            const typeMatch = !typeFilter || transactionType === typeFilter
            const statusMatch = !statusFilter || transactionStatus === statusFilter
            const dateMatch = matchesDateRange(transaction, startDate, endDate)

            return typeMatch && statusMatch && dateMatch
        })
    }

    function normalizeToken(value) {
        return String(value || '').trim().toLowerCase()
    }

    function getOwnerKey() {
        const userId = String(
            userStore.currentUser?.id ??
            userStore.currentUser?.userId ??
            userStore.currentUser?.user?.id ??
            ''
        )
        const username = normalizeToken(userStore.currentUser?.username || userStore.currentUser?.userName)
        const walletId = String(userStore.wallet?.id ?? userStore.currentUser?.wallet?.id ?? '')
        const tokenSuffix = String(userStore.token || '').slice(-12)
        return `${ userId }|${ username }|${ walletId }|${ tokenSuffix }`
    }

    function hasValidOwnerKey(ownerKey) {
        return String(ownerKey || '')
            .split('|')
            .some((segment) => String(segment || '').trim() !== '')
    }

    function cacheKey(ownerKey) {
        return `${ LOCAL_TX_PREFIX }|${ ownerKey }`
    }

    function readCachedTransactions(ownerKey) {
        if (!ownerKey) return []
        try {
            const raw = localStorage.getItem(cacheKey(ownerKey))
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []
            return parsed.map((item) => enrichTransactionForCurrentUser(item))
        }
        catch {
            return []
        }
    }

    function writeCachedTransactions(ownerKey, list) {
        if (!ownerKey) return
        try {
            localStorage.setItem(cacheKey(ownerKey), JSON.stringify(list))
        }
        catch {
            // Ignore storage write failures.
        }
    }

    function enrichTransactionForCurrentUser(transaction) {
        const currentUserId = String(
            userStore.currentUser?.id ??
            userStore.currentUser?.userId ??
            userStore.currentUser?.user?.id ??
            ''
        )
        const currentUsername = normalizeToken(userStore.currentUser?.username || userStore.currentUser?.userName)
        const currentWalletId = String(userStore.wallet?.id ?? userStore.currentUser?.wallet?.id ?? '')

        const fromUserId = String(
            transaction.fromUserId ??
            transaction.senderUserId ??
            transaction.sourceUserId ??
            transaction.senderId ??
            ''
        )
        const toUserId = String(
            transaction.toUserId ??
            transaction.recipientUserId ??
            transaction.destinationUserId ??
            transaction.receiverId ??
            ''
        )
        const fromUsername = normalizeToken(
            transaction.fromUsername ??
            transaction.senderUsername ??
            transaction.sourceUsername ??
            transaction.sender ??
            transaction.fromUserName
        )
        const toUsername = normalizeToken(
            transaction.toUsername ??
            transaction.recipientUsername ??
            transaction.destinationUsername ??
            transaction.receiver ??
            transaction.beneficiaryUsername ??
            transaction.toUserName
        )
        const fromWalletId = String(
            transaction.fromWalletId ??
            transaction.sourceWalletId ??
            transaction.senderWalletId ??
            ''
        )
        const toWalletId = String(
            transaction.toWalletId ??
            transaction.destinationWalletId ??
            transaction.receiverWalletId ??
            transaction.beneficiaryWalletId ??
            ''
        )

        const matchesFrom = (
            (currentUserId && fromUserId === currentUserId) ||
            (currentUsername && fromUsername === currentUsername) ||
            (currentWalletId && fromWalletId === currentWalletId)
        )
        const matchesTo = (
            (currentUserId && toUserId === currentUserId) ||
            (currentUsername && toUsername === currentUsername) ||
            (currentWalletId && toWalletId === currentWalletId)
        )

        let resolvedType = String(transaction.type || '').trim().toLowerCase()
        if (matchesFrom && !matchesTo) {
            resolvedType = 'debit'
        }
        else if (matchesTo && !matchesFrom) {
            resolvedType = 'credit'
        }

        return {
            ...transaction,
            type: resolvedType || transaction.type,
            fromUserId: (transaction.fromUserId ?? fromUserId) || undefined,
            toUserId: (transaction.toUserId ?? toUserId) || undefined,
            fromUsername: (transaction.fromUsername ?? fromUsername) || undefined,
            toUsername: (transaction.toUsername ?? toUsername) || undefined,
            fromWalletId: (transaction.fromWalletId ?? fromWalletId) || undefined,
            toWalletId: (transaction.toWalletId ?? toWalletId) || undefined
        }
    }

    function paginateList(list, page, size) {
        const safeSize = Math.max(1, Number(size || 10))
        const totalPages = Math.max(1, Math.ceil(list.length / safeSize))
        const safePage = Math.min(Math.max(0, Number(page || 0)), totalPages - 1)
        const start = safePage * safeSize
        const end = start + safeSize

        return {
            pageItems: list.slice(start, end),
            normalizedPagination: {
                page: safePage,
                totalPages,
                last: safePage >= totalPages - 1,
                totalItems: list.length
            }
        }
    }

    function transactionKey(transaction) {
        return String(
            transaction?.id ??
            transaction?.transactionId ??
            transaction?.referenceNumber ??
            transaction?.reference ??
            `${ transaction?.timestamp ?? transaction?.date ?? transaction?.createdAt ?? '' }|${ transaction?.amount ?? '' }|${ transaction?.description ?? '' }`
        )
    }

    function mergeTransactionLists(primary, secondary) {
        const seen = new Set()
        const merged = []

        for (const transaction of [...primary, ...secondary]) {
            const key = transactionKey(transaction)
            if (seen.has(key)) continue
            seen.add(key)
            merged.push(transaction)
        }

        return merged.sort((a, b) => {
            const aTime = new Date(a.timestamp || a.date || a.createdAt || 0).getTime()
            const bTime = new Date(b.timestamp || b.date || b.createdAt || 0).getTime()
            return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
        })
    }

    async function fetchTransactions(userId, requestFilters) {
        const ownerKey = getOwnerKey()
        const canUseOwnerScopedCache = hasValidOwnerKey(ownerKey)
        const cachedTransactions = canUseOwnerScopedCache ? readCachedTransactions(ownerKey) : []
        const requestId = latestFetchRequestId.value + 1
        latestFetchRequestId.value = requestId
        loading.value = true
        error.value = ''
        try {
            if (ownerKey !== activeOwnerKey.value) {
                activeOwnerKey.value = ownerKey
                transactions.value = []
                allTransactions.value = []
                pagination.value = { page: 0, totalPages: 1, last: true, totalItems: 0 }
            }

            const normalizedRequestFilters = requestFilters || {}
            const requestedPage = Number(normalizedRequestFilters.page ?? 0)
            const requestedSize = Number(normalizedRequestFilters.size ?? 10)
            const previousTransactions = [...allTransactions.value]
            pageSize.value = requestedSize
            const response = await transactionApi.getTransactions(userId, {
                ...normalizedRequestFilters,
                page: 0,
                size: Math.max(100, requestedSize),
                limit: Math.max(100, requestedSize)
            })

            // Ignore stale fetch responses after user/account switch or newer request.
            if (requestId !== latestFetchRequestId.value || ownerKey !== activeOwnerKey.value) {
                return
            }

            const { normalizedList } = normalizeTransactionResponse(response)
            const enrichedFetched = normalizedList.map(enrichTransactionForCurrentUser)
            allTransactions.value = mergeTransactionLists(
                mergeTransactionLists(enrichedFetched, previousTransactions),
                cachedTransactions
            )
            if (canUseOwnerScopedCache) {
                writeCachedTransactions(ownerKey, allTransactions.value)
            }

            const filteredList = applyClientFilters(allTransactions.value, normalizedRequestFilters)
            const { pageItems, normalizedPagination } = paginateList(filteredList, requestedPage, requestedSize)
            transactions.value = pageItems
            pagination.value = normalizedPagination
        }
        catch (error){
            if (requestId !== latestFetchRequestId.value || ownerKey !== activeOwnerKey.value) {
                return
            }
            const apiError = handleApiError(error)
            error.value = apiError.message
            allTransactions.value = mergeTransactionLists(allTransactions.value, cachedTransactions)
            const filteredList = applyClientFilters(allTransactions.value, requestFilters || {})
            const { pageItems, normalizedPagination } = paginateList(
                filteredList,
                Number((requestFilters || {}).page ?? 0),
                Number((requestFilters || {}).size ?? pageSize.value)
            )
            transactions.value = pageItems
            pagination.value = normalizedPagination
        }
        finally{
            if (requestId === latestFetchRequestId.value) {
                loading.value = false
            }
        }
    }

    async function createTransfer(data) {
        return transactionApi.transfer(data)
    }

    async function createMerchantPayment(data) {
        return transactionApi.merchantPayment(data)
    }

    function addLocalTransaction(transaction) {
        const ownerKey = getOwnerKey()
        if (!hasValidOwnerKey(ownerKey)) {
            return null
        }
        if (ownerKey !== activeOwnerKey.value) {
            activeOwnerKey.value = ownerKey
            transactions.value = []
            allTransactions.value = []
            pagination.value = { page: 0, totalPages: 1, last: true, totalItems: 0 }
        }

        const normalized = normalizeTransactionItem(transaction)
        allTransactions.value = [normalized, ...allTransactions.value]
        writeCachedTransactions(ownerKey, allTransactions.value)
        refreshVisibleTransactions()
        return normalized
    }

    function resetState() {
        latestFetchRequestId.value += 1
        transactions.value = []
        allTransactions.value = []
        filters.value = { type: '', status: '', dateRange: '' }
        pagination.value = { page: 0, totalPages: 1, last: true, totalItems: 0 }
        pageSize.value = 10
        loading.value = false
        error.value = ''
        activeOwnerKey.value = ''
    }

    function refreshVisibleTransactions() {
        const filteredList = applyClientFilters(allTransactions.value, filters.value)
        const { pageItems, normalizedPagination } = paginateList(filteredList, pagination.value.page, pageSize.value)
        transactions.value = pageItems
        pagination.value = normalizedPagination
    }

    function updateLocalTransaction(matchToken, updates = {}) {
        const token = String(matchToken || '')
        if (!token) return null

        let updatedTransaction = null
        allTransactions.value = allTransactions.value.map((transaction) => {
            const candidates = [
                transaction.id,
                transaction.transactionId,
                transaction.referenceNumber,
                transaction.reference
            ].map((value) => String(value || ''))

            if (!candidates.includes(token)) return transaction

            const promotedId =
                updates?.id ??
                updates?.transactionId ??
                updates?.referenceNumber ??
                updates?.reference ??
                transaction?.id

            const merged = normalizeTransactionItem({
                ...transaction,
                ...updates,
                id: promotedId,
                status: normalizeTransactionStatus({ ...transaction, ...updates })
            })
            updatedTransaction = merged
            return merged
        })

        if (updatedTransaction) {
            writeCachedTransactions(getOwnerKey(), allTransactions.value)
            refreshVisibleTransactions()
        }

        return updatedTransaction
    }

    function setFilters(newFilters) {
        filters.value = newFilters
    }

    return {
        transactions,
        allTransactions,
        filters,
        pagination,
        loading,
        error,
        fetchTransactions,
        createTransfer,
        createMerchantPayment,
        addLocalTransaction,
        updateLocalTransaction,
        setFilters,
        resetState
    }
})
