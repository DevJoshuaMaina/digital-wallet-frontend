import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../src/stores/user.js'

const createStorage = () => {
  const map = new Map()
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null
    },
    setItem(key, value) {
      map.set(key, String(value))
    },
    removeItem(key) {
      map.delete(key)
    },
    clear() {
      map.clear()
    },
  }
}

export async function run() {
  globalThis.localStorage = createStorage()
  localStorage.setItem('user', '{bad json')
  localStorage.setItem('token', 'abc-token')

  setActivePinia(createPinia())
  const userStore = useUserStore()

  assert.doesNotThrow(() => userStore.loadFromStorage())
  assert.equal(userStore.currentUser, null)
  assert.equal(userStore.wallet, null)
  assert.equal(userStore.token, 'abc-token')
  assert.equal(userStore.isAuthenticated, true)
  assert.equal(localStorage.getItem('user'), null)

  globalThis.localStorage = createStorage()
  localStorage.setItem(
    'user',
    JSON.stringify({
      userId: 42,
      userName: 'demo-user',
      wallet: { id: 7, balance: 1000 },
    })
  )

  setActivePinia(createPinia())
  const userStoreFromStorage = useUserStore()
  userStoreFromStorage.loadFromStorage()

  assert.equal(userStoreFromStorage.currentUser.id, 42)
  assert.equal(userStoreFromStorage.currentUser.username, 'demo-user')
  assert.equal(userStoreFromStorage.wallet.id, 7)
  assert.equal(userStoreFromStorage.balance, 1000)

  globalThis.localStorage = createStorage()
  setActivePinia(createPinia())
  const userStoreForLogout = useUserStore()

  userStoreForLogout.setToken('token-123')
  assert.equal(localStorage.getItem('token'), 'token-123')
  assert.equal(userStoreForLogout.isAuthenticated, true)

  userStoreForLogout.logout()
  assert.equal(userStoreForLogout.currentUser, null)
  assert.equal(userStoreForLogout.token, '')
  assert.equal(userStoreForLogout.isAuthenticated, false)
  assert.equal(localStorage.getItem('token'), null)
  assert.equal(localStorage.getItem('user'), null)
}
