import assert from 'node:assert/strict'
import { normalizeTransactionItem, normalizeTransactionResponse } from '../src/utils/transactionNormalizer.js'

export async function run() {
  const normalizedItem = normalizeTransactionItem({
    transactionId: 'tx-1',
    transactionAmount: '1500',
    direction: 'DEBIT',
    narration: 'Transfer to friend',
    createdAt: '2026-02-18T10:00:00Z',
  })

  assert.equal(normalizedItem.id, 'tx-1')
  assert.equal(normalizedItem.amount, 1500)
  assert.equal(normalizedItem.type, 'debit')
  assert.equal(normalizedItem.description, 'Transfer to friend')
  assert.equal(normalizedItem.timestamp, '2026-02-18T10:00:00Z')

  const recordsResponse = normalizeTransactionResponse({
    records: [
      {
        id: 'a',
        amount: 50,
        type: 'CREDIT',
      },
    ],
    pageInfo: { number: 2, totalPages: 5, last: false },
  })

  assert.equal(recordsResponse.normalizedList.length, 1)
  assert.equal(recordsResponse.normalizedList[0].type, 'credit')
  assert.equal(recordsResponse.normalizedPagination.page, 2)
  assert.equal(recordsResponse.normalizedPagination.totalPages, 5)
  assert.equal(recordsResponse.normalizedPagination.last, false)

  const emptyResponse = normalizeTransactionResponse({})
  assert.deepEqual(emptyResponse.normalizedList, [])
  assert.equal(emptyResponse.normalizedPagination.page, 0)
  assert.equal(emptyResponse.normalizedPagination.totalPages, 1)
  assert.equal(emptyResponse.normalizedPagination.last, true)

  const nestedResponse = normalizeTransactionResponse({
    success: true,
    data: {
      payload: {
        content: [
          { id: 'older', amount: 20, createdAt: '2026-01-01T00:00:00Z' },
          { id: 'newer', amount: 40, createdAt: '2026-02-01T00:00:00Z' },
        ],
      },
      pageInfo: { page: 0, totalPages: 2, last: false },
    },
  })

  assert.equal(nestedResponse.normalizedList.length, 2)
  assert.equal(nestedResponse.normalizedList[0].id, 'newer')
  assert.equal(nestedResponse.normalizedPagination.totalPages, 2)
}
