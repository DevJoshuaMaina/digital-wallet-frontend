import assert from 'node:assert/strict'
import { handleApiError } from '../src/utils/errorHandler.js'

export async function run() {
  const result = handleApiError({
    response: {
      status: 400,
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Invalid email address'],
        },
      },
    },
  })

  assert.equal(result.status, 400)
  assert.equal(result.message, 'Validation failed')
  assert.deepEqual(result.fieldErrors, { email: 'Invalid email address' })

  const requestOnlyResult = handleApiError({ request: {} })
  assert.equal(requestOnlyResult.status, 0)
  assert.equal(requestOnlyResult.message, 'No response from server. Please check your connection.')

  const genericResult = handleApiError(new Error('Unexpected failure'))
  assert.equal(genericResult.status, 0)
  assert.equal(genericResult.message, 'Unexpected failure')
}
