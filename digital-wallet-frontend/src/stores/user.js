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
        wallet.value = user?.wallet || null
        isAuthenticated.value = Boolean(currentUser.value || token.value)
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
    }

    function setWallet(walletData) {
        wallet.value = walletData
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
            const user = JSON.parse(storedUser)
            currentUser.value = user
            wallet.value = user?.wallet || null
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
