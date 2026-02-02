import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

export const useUserStore = defineStore('user', () => {
    //State
    const currentUser = ref(null)
    const wallet = ref(null)
    const isAuthenticated = ref(false)

    //Getters
    const userName = computed(() => currentUser.value?.fullName || '')
    const balance = computed(() => wallet.value?.balance || 0)

    //Actions
    function setUser(user) {
        currentUser.value = user
        wallet.value = user.wallet
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user))
    }

    function setWallet(walletData) {
        wallet.value = walletData
    }

    function logout() {
        currentUser.value = null
        wallet.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    function loadFromStorage() {
        const stored = localStorage.getItem('user')
        if (stored) {
            const user = JSON.parse(stored)
            setUser(user)
        }
    }

    return {
        currentUser,
        wallet,
        isAuthenticated,
        userName,
        balance,
        setUser,
        setWallet,
        logout,
        loadFromStorage
    }
})