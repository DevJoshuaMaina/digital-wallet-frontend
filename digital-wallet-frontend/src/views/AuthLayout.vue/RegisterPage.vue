<template>
    <div class="min-h-screen flex items-center justify-center">
        <BaseCard class="w-full max-w-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
            <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
            <form @submit.prevent="handleRegister">
                <BaseInput v-model="userData.fullName" label="Full Name" placeholder="Enter full name" :error="errors.fullName"/>
                <BaseInput v-model="userData.username" label="Username" placeholder="Enter username" :error="errors.username"/>
                <BaseInput v-model="userData.email" label="Email" placeholder="Enter email" :error="errors.email"/>
                <BaseInput v-model="userData.phoneNumber" type="tel" label="Phone Number" placeholder="Enter phone number" :error="errors.phoneNumber"/>
                <BaseInput v-model="userData.pin" type="password" label="PIN" placeholder="4-6 digit PIN" :error="errors.pin"/>
                <BaseInput v-model="confirmPin" type="password" label="Confirm PIN" placeholder="Confirm PIN" :error="errors.confirmPin"/>
                <BaseButton type="submit" :loading="loading" class="w-full mt-4">Register</BaseButton>
            </form>
            <p class="text-center mt-4">Already have an account? <router-link to="/login" class="text-primary-600">Login</router-link></p>
        </BaseCard>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/user'
    import { useToastStore } from '@/stores/toast'
    import userApi from '@/services/userApi'
    import walletApi from '@/services/walletApi'
    import { handleApiError } from '@/utils/errorHandler'
    import BaseCard from '@/components/base/BaseCard.vue'
    import BaseInput from '@/components/base/BaseInput.vue'
    import BaseButton from '@/components/base/BaseButton.vue'
    import BaseAlert from '@/components/base/BaseAlert.vue'

    const router = useRouter()
    const userStore = useUserStore()
    const toastStore = useToastStore()

    const userData = ref({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        pin: ''
    })

    const confirmPin = ref('')
    const errors = ref({})
    const loading = ref(false)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pinRegex = /^\d{4,6}$/

    const validateForm = () => {
        errors.value = {}
        userData.value.fullName = userData.value.fullName.trim()
        userData.value.username = userData.value.username.trim()
        userData.value.email = userData.value.email.trim()
        userData.value.phoneNumber = userData.value.phoneNumber.trim()
        userData.value.pin = userData.value.pin.trim()
        confirmPin.value = confirmPin.value.trim()

        if (!userData.value.fullName) errors.value.fullName = 'Full name is required'
        if (!userData.value.username) errors.value.username = 'Username is required'
        if (!userData.value.email) {
            errors.value.email = 'Email is required'
        }
        else if (!emailRegex.test(userData.value.email)) {
            errors.value.email = 'Enter a valid email address'
        }
        if (!userData.value.phoneNumber) errors.value.phoneNumber = 'Phone Number is required'
        if (!pinRegex.test(userData.value.pin)) errors.value.pin = 'PIN must be 4-6 digits'
        if (userData.value.pin !== confirmPin.value) errors.value.confirmPin = 'PINs do not match'
        return Object.keys(errors.value).length === 0
    }

    const handleRegister = async () => {
        if (!validateForm()) return
        loading.value = true
        try {
            await userApi.register(userData.value)
            toastStore.success('Account created successfully. Please login.')
            router.push('/login')
        }
        catch (error) {
            const err = handleApiError(error)
            const maybeCreatedButFailedResponse =
                err.status === 500 ||
                /already exists|duplicate/i.test(err.message || '')

            if (maybeCreatedButFailedResponse) {
                try {
                    const loginResponse = await userApi.login({
                        username: userData.value.username,
                        pin: userData.value.pin
                    })
                    const token = loginResponse?.token || loginResponse?.data?.token
                    const usernameFromResponse = loginResponse?.username || loginResponse?.data?.username || userData.value.username
                    if (token) {
                        userStore.setToken(token)
                    }

                    let user = loginResponse?.user || loginResponse?.data?.user
                    if (!user && usernameFromResponse) {
                        try {
                            const userProfile = await userApi.getUserByUsername(usernameFromResponse)
                            user = userProfile?.data || userProfile?.user || userProfile
                        }
                        catch {
                            // Keep fallback user below when profile lookup is unavailable.
                        }
                    }

                    const resolvedWallet = await walletApi.resolveWallet(user)

                    if (!user) {
                        user = {
                            username: usernameFromResponse,
                            fullName: usernameFromResponse
                        }
                    }

                    user.wallet = resolvedWallet || user.wallet || { balance: 0, walletNumber: 'N/A' }

                    if (user) {
                        userStore.setUser(user)
                        toastStore.success('Account recovery successful. You are now logged in.')
                        router.push('/dashboard')
                        return
                    }
                }
                catch {
                    // Fall through to surface original registration error.
                }
            }

            errors.value = {
                ...errors.value,
                ...err.fieldErrors,
                general: maybeCreatedButFailedResponse
                    ? `${err.message} If this was your first attempt, try logging in with your username and PIN.`
                    : err.message
            }
            toastStore.error(errors.value.general)
        }
        finally {
            loading.value = false
        }
    }

</script>
