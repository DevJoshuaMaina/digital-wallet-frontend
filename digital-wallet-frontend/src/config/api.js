export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_BY_USERNAME: (username) => `/users/username/${username}`,
  
  // Wallet endpoints
  WALLETS: '/wallets',
  WALLET_BY_USER: (userId) => `/wallets/user/${userId}`,
  ADD_MONEY: (walletId) => `/wallets/${walletId}/add-money`,
  
  // Transaction endpoints
  TRANSACTIONS: '/transactions',
  TRANSFER: '/transactions/transfer',
  MERCHANT_PAYMENT: '/transactions/merchant-payment',
  USER_TRANSACTIONS: (userId) => `/transactions/user/${userId}`,
  TRANSACTION_STATS: (userId) => `/transactions/user/${userId}/stats`,
  
  // Merchant endpoints
  MERCHANTS: '/merchants',
  MERCHANT_BY_CODE: (code) => `/merchants/code/${code}`,
} 