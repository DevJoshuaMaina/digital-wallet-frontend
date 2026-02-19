import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export async function run() {
  const routerFile = readFileSync(resolve('src/router/index.js'), 'utf8')
  const requiredPaths = [
    "path: '/'",
    "path: '/login'",
    "path: '/register'",
    "path: '/dashboard'",
    "path: '/wallet'",
    "path: '/transfer'",
    "path: '/merchants'",
    "path: '/transactions'",
    "path: '/profile'",
    "path: '/:pathMatch(.*)*'",
  ]

  for (const snippet of requiredPaths) {
    assert.equal(routerFile.includes(snippet), true, `Missing route snippet: ${snippet}`)
  }

  assert.equal(routerFile.includes('to.meta.requiresAuth && !userStore.isAuthenticated'), true)
  assert.equal(routerFile.includes("next('/login')"), true)
  assert.equal(routerFile.includes("to.name === 'login' && userStore.isAuthenticated"), true)
  assert.equal(routerFile.includes("next('/dashboard')"), true)
}
