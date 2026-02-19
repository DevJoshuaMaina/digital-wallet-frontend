import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    //State
    const currentUser = ref(null)
    const wallet = ref(null)
    const token = ref('')
    const isAuthenticated = ref(false)

    //Getters
    const userName = computed(() => currentUser.value?.fullName || '')
    const balance = computed(() => wallet.value?.balance || 0)

    //Actions
    function setUser(user) {
        currentUser.value = user
            ? {
                ...user,
                id: user.id ?? user.userId ?? null,
                username: user.username || user.userName || ''
            }
            : null
        wallet.value = currentUser.value?.wallet || null
        isAuthenticated.value = Boolean(currentUser.value || token.value)
        if (currentUser.value) {
            localStorage.setItem('user', JSON.stringify(currentUser.value))
        }
    }

    function setWallet(walletData) {
        wallet.value = walletData
        if (currentUser.value) {
            currentUser.value = {
                ...currentUser.value,
                wallet: walletData
            }
            localStorage.setItem('user', JSON.stringify(currentUser.value))
        }
    }

    function setToken(authToken) {
        token.value = authToken || ''
        if (token.value) {
            localStorage.setItem('token', token.value)
        }
        else {
            localStorage.removeItem('token')
        }
        isAuthenticated.value = Boolean(currentUser.value || token.value)
    }

    function logout() {
        currentUser.value = null
        wallet.value = null
        token.value = ''
        isAuthenticated.value = false
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    function loadFromStorage() {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (storedToken) {
            token.value = storedToken
        }
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser)
                currentUser.value = {
                    ...user,
                    id: user.id ?? user.userId ?? null,
                    username: user.username || user.userName || ''
                }
                wallet.value = user?.wallet || null
            }
            catch {
                localStorage.removeItem('user')
                currentUser.value = null
                wallet.value = null
            }
        }
        isAuthenticated.value = Boolean(currentUser.value || token.value)
    }

    return {
        currentUser,
        wallet,
        token,
        isAuthenticated,
        userName,
        balance,
        setUser,
        setWallet,
        setToken,
        logout,
        loadFromStorage
    }
})
