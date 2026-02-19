import apiClient from './api'
import { API_ENDPOINTS } from '@/config/api'

const STORAGE_KEY = 'wallet_requests_v1'

const normalizeToken = (value) => String(value || '').trim().toLowerCase()

const readLocalRequests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

const writeLocalRequests = (requests) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

const normalizeRequest = (request) => ({
  id: String(request?.id ?? request?.requestId ?? `${Date.now()}-${Math.random()}`),
  requesterUsername: request?.requesterUsername ?? request?.fromUsername ?? request?.createdBy ?? '',
  requestedFromUsername: request?.requestedFromUsername ?? request?.toUsername ?? request?.requestTo ?? '',
  amount: Number(request?.amount ?? 0),
  note: String(request?.note ?? request?.description ?? ''),
  status: String(request?.status ?? 'PENDING').toUpperCase(),
  createdAt: request?.createdAt ?? request?.timestamp ?? new Date().toISOString(),
  updatedAt: request?.updatedAt ?? request?.createdAt ?? request?.timestamp ?? new Date().toISOString(),
  paidReference: request?.paidReference ?? request?.reference ?? null
})

const unwrapList = (payload) => {
  const source = payload?.data ?? payload ?? {}
  if (Array.isArray(source)) return source
  if (Array.isArray(source.content)) return source.content
  if (Array.isArray(source.requests)) return source.requests
  if (Array.isArray(source.items)) return source.items
  return []
}

export default {
  async createRequest(requestPayload) {
    const normalized = normalizeRequest({
      ...requestPayload,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    try {
      const response = await apiClient.post(API_ENDPOINTS.REQUESTS, normalized)
      return normalizeRequest(response?.data ?? response ?? normalized)
    }
    catch {
      const requests = readLocalRequests()
      requests.unshift(normalized)
      writeLocalRequests(requests)
      return normalized
    }
  },

  async getIncomingRequests(username) {
    const normalizedUsername = normalizeToken(username)
    try {
      const response = await apiClient.get(API_ENDPOINTS.INCOMING_REQUESTS, { params: { username: normalizedUsername } })
      return unwrapList(response).map(normalizeRequest)
    }
    catch {
      return readLocalRequests()
        .map(normalizeRequest)
        .filter((request) => normalizeToken(request.requestedFromUsername) === normalizedUsername)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  },

  async getOutgoingRequests(username) {
    const normalizedUsername = normalizeToken(username)
    try {
      const response = await apiClient.get(API_ENDPOINTS.OUTGOING_REQUESTS, { params: { username: normalizedUsername } })
      return unwrapList(response).map(normalizeRequest)
    }
    catch {
      return readLocalRequests()
        .map(normalizeRequest)
        .filter((request) => normalizeToken(request.requesterUsername) === normalizedUsername)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  },

  async updateRequestStatus(requestId, status, extra = {}) {
    const normalizedStatus = String(status || '').toUpperCase()
    try {
      const response = await apiClient.patch(API_ENDPOINTS.REQUEST_BY_ID(requestId), {
        status: normalizedStatus,
        ...extra
      })
      return normalizeRequest(response?.data ?? response ?? { id: requestId, status: normalizedStatus, ...extra })
    }
    catch {
      const requests = readLocalRequests().map(normalizeRequest)
      const updated = requests.map((request) =>
        request.id === String(requestId)
          ? {
            ...request,
            status: normalizedStatus,
            updatedAt: new Date().toISOString(),
            ...extra
          }
          : request
      )
      writeLocalRequests(updated)
      return normalizeRequest(updated.find((request) => request.id === String(requestId)) || { id: requestId, status: normalizedStatus, ...extra })
    }
  }
}
