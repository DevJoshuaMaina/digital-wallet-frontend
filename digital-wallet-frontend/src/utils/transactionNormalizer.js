const normalizeToken = (value) => String(value || '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_')

const inferResolvedType = (transaction, amount) => {
  const rawType = normalizeToken(transaction?.type ?? transaction?.transactionType ?? transaction?.direction)
  const description = normalizeToken(transaction?.description ?? transaction?.narration ?? transaction?.remark)
  const fromUsername = normalizeToken(transaction?.fromUsername ?? transaction?.senderUsername ?? transaction?.sourceUsername)
  const toUsername = normalizeToken(transaction?.toUsername ?? transaction?.recipientUsername ?? transaction?.destinationUsername)
  const fromWalletId = normalizeToken(transaction?.fromWalletId ?? transaction?.sourceWalletId)
  const toWalletId = normalizeToken(transaction?.toWalletId ?? transaction?.destinationWalletId)

  const creditTypes = new Set(['credit', 'received', 'incoming', 'deposit', 'topup', 'add_money', 'refund'])
  const debitTypes = new Set(['debit', 'sent', 'outgoing', 'transfer', 'merchant_payment', 'payment', 'withdrawal'])

  if (!fromUsername && toUsername) return 'credit'
  if (fromUsername && !toUsername) return 'debit'
  if (!fromWalletId && toWalletId) return 'credit'
  if (fromWalletId && !toWalletId) return 'debit'

  if (description.includes('received') || description.includes('from_')) return 'credit'
  if (description.includes('sent') || description.includes('transfer_to') || description.includes('payment_to')) return 'debit'

  if (debitTypes.has(rawType)) return 'debit'
  if (creditTypes.has(rawType)) return 'credit'

  return amount < 0 ? 'debit' : 'credit'
}

export const normalizeTransactionStatus = (transaction) => {
  const rawStatus = normalizeToken(
    transaction?.status ??
    transaction?.transactionStatus ??
    transaction?.state ??
    transaction?.result ??
    transaction?.outcome
  )

  if (transaction?.success === true || transaction?.isSuccessful === true) return 'SUCCESSFUL'
  if (transaction?.success === false || transaction?.isSuccessful === false) return 'FAILURE'
  if (rawStatus === '') return 'PENDING'
  if (['success', 'successful', 'completed', 'complete', 'paid', 'approved'].includes(rawStatus)) return 'SUCCESSFUL'
  if (['failed', 'failure', 'unsuccessful', 'declined', 'rejected', 'error', 'cancelled', 'canceled'].includes(rawStatus)) return 'FAILURE'
  if (['pending', 'processing', 'in_progress', 'queued', 'initiated'].includes(rawStatus)) return 'PENDING'

  return String(transaction?.status ?? transaction?.transactionStatus ?? 'PENDING').toUpperCase()
}

export function normalizeTransactionItem(transaction) {
  const amount = Number(
    transaction?.amount ??
    transaction?.transactionAmount ??
    transaction?.value ??
    0
  )

  const resolvedType = inferResolvedType(transaction, amount)

  return {
    ...transaction,
    id: transaction?.id ?? transaction?.transactionId ?? transaction?.referenceNumber ?? `${Date.now()}-${Math.random()}`,
    transactionId: transaction?.transactionId ?? transaction?.id ?? 'N/A',
    referenceNumber: transaction?.referenceNumber ?? transaction?.reference ?? 'N/A',
    description: transaction?.description ?? transaction?.narration ?? transaction?.remark ?? 'Transaction',
    status: normalizeTransactionStatus(transaction),
    timestamp: transaction?.timestamp ?? transaction?.date ?? transaction?.createdAt ?? null,
    amount,
    type: resolvedType,
  }
}

const listKeys = ['content', 'transactions', 'items', 'results', 'records', 'history', 'data']

const asTimestamp = (value) => {
  if (!value) return 0
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

const findFirstArray = (value, depth = 0) => {
  if (!value || depth > 6) return null

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'object') return null

  for (const key of listKeys) {
    if (Array.isArray(value[key])) {
      return value[key]
    }
  }

  for (const key of Object.keys(value)) {
    const nested = findFirstArray(value[key], depth + 1)
    if (nested) return nested
  }

  return null
}

const findPagination = (value, depth = 0) => {
  if (!value || typeof value !== 'object' || depth > 6) {
    return {}
  }

  const pageInfo = value?.pagination ?? value?.pageInfo ?? value
  const hasPagingFields =
    pageInfo?.page !== undefined ||
    pageInfo?.number !== undefined ||
    pageInfo?.totalPages !== undefined ||
    pageInfo?.pages !== undefined ||
    pageInfo?.last !== undefined

  if (hasPagingFields) {
    return {
      page: Number(value?.page ?? pageInfo?.page ?? pageInfo?.number ?? 0),
      totalPages: Number(value?.totalPages ?? pageInfo?.totalPages ?? pageInfo?.pages ?? 1),
      last: Boolean(value?.last ?? pageInfo?.last),
    }
  }

  for (const key of Object.keys(value)) {
    const nested = findPagination(value[key], depth + 1)
    if (Object.keys(nested).length > 0) return nested
  }

  return {}
}

export function normalizeTransactionResponse(response) {
  const payload = response ?? {}
  const list = findFirstArray(payload) || []
  const paging = findPagination(payload)

  const normalizedList = Array.isArray(list)
    ? list.map(normalizeTransactionItem).sort((a, b) =>
      asTimestamp(b.timestamp || b.date || b.createdAt) - asTimestamp(a.timestamp || a.date || a.createdAt)
    )
    : []

  const page = Number(paging.page ?? 0)
  const totalPages = Number(paging.totalPages ?? 1)
  const last = paging.last !== undefined
    ? Boolean(paging.last)
    : (totalPages > 0 ? page >= totalPages - 1 : true)

  return {
    normalizedList,
    normalizedPagination: {
      page,
      totalPages,
      last,
    },
  }
}
