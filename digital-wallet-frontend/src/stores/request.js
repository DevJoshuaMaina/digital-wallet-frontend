import { defineStore } from 'pinia'
import { ref } from 'vue'
import requestApi from '@/services/requestApi'
import { handleApiError } from '@/utils/errorHandler'

const normalizeToken = (value) => String(value || '').trim().toLowerCase()

export const useRequestStore = defineStore('request', () => {
  const incomingRequests = ref([])
  const outgoingRequests = ref([])
  const loading = ref(false)
  const error = ref('')

  const sortByDateDesc = (list) =>
    [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  async function fetchRequests(currentUsername) {
    const username = normalizeToken(currentUsername)
    if (!username) {
      incomingRequests.value = []
      outgoingRequests.value = []
      return
    }

    loading.value = true
    error.value = ''
    try {
      const [incoming, outgoing] = await Promise.all([
        requestApi.getIncomingRequests(username),
        requestApi.getOutgoingRequests(username)
      ])
      incomingRequests.value = sortByDateDesc(incoming)
      outgoingRequests.value = sortByDateDesc(outgoing)
    }
    catch (err) {
      const apiError = handleApiError(err)
      error.value = apiError.message
    }
    finally {
      loading.value = false
    }
  }

  async function createRequest(payload) {
    const created = await requestApi.createRequest(payload)
    outgoingRequests.value = sortByDateDesc([created, ...outgoingRequests.value])
    return created
  }

  async function markAsPaid(requestId, paidReference) {
    const updated = await requestApi.updateRequestStatus(requestId, 'PAID', {
      paidReference
    })
    incomingRequests.value = incomingRequests.value.map((request) =>
      request.id === String(requestId)
        ? { ...request, ...updated }
        : request
    )
    outgoingRequests.value = outgoingRequests.value.map((request) =>
      request.id === String(requestId)
        ? { ...request, ...updated }
        : request
    )
    return updated
  }

  async function declineRequest(requestId) {
    const updated = await requestApi.updateRequestStatus(requestId, 'DECLINED')
    incomingRequests.value = incomingRequests.value.map((request) =>
      request.id === String(requestId)
        ? { ...request, ...updated }
        : request
    )
    outgoingRequests.value = outgoingRequests.value.map((request) =>
      request.id === String(requestId)
        ? { ...request, ...updated }
        : request
    )
    return updated
  }

  return {
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    fetchRequests,
    createRequest,
    markAsPaid,
    declineRequest
  }
})
