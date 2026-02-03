<template>
    <div class="min-h-screen flex items-center justify-center">
        <BaseCard class="w-full max=w=md">
            <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
            <form @submit.prevent="handleRegister">
                <BaseInput v-model="userData.fullName" label="Full Name" placeholder="Enter full name" :error="errors.fullName"/>
                <BaseInput v-model="userData.username" label="Username" placeholder="Enter username" :error="errors.username"/>
                <BaseInput v-model="userData.email" label="Email" placeholder="Enter email" :error="errors.email"/>
                <BaseInput v-model="userData.phoneNumber" type="tel" label="Phone Numner (Optional)" placeholder="Enter phone number"/>
                <BaseInput v-model="userData.pin" type="password" label="PIN" placeholder="4-6 digit PIN" :error="errors.pin"/>
                <BaseInput v-model="confirmPin" type="password" label="Confirm PIN" placeholder="Confirm username" :error="errors.confirmPin"/>
                <BaseButton type="submit" :loading="loading" class="w-full mt-4">Register</BaseButton>
            </form>
            <p class="text-center mt-4">
                Already have an account? <router-link to="/login" class="text-primary-600">Login</router-link>
            </p>
        </BaseCard>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import {userRouter} from 'vue-router'
    import userApi from '@/services/userApi'
    import { handleApiError } from '@/utils/errorHandler'
    import BaseCard from '@/components/base/BaseCard.vue'
    import BaseInput from '@/components/base/BaseInput.vue'
    import BaseButton from '@/components/base/BaseButton.vue'

    const router = userRouter()

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

    const validateForm = () => {
        errors.value = {}
        if (!userData.value.fullName) errors.value.fullName = 'Full name is required'
        if (!userData.value.username) errors.value.username = 'Username is required'
        if (!userData.value.email) errors.value.email = 'Email is required'
        if (!userData.value.pin || userData.value.pin.length < 4) errors.value.confirmPin = 'PINs must be 4-6 digits'
        if (!userData.value.pin !== confirmPin.value) errors.value.confirmPin = 'PINs do not match'
        return Object.keys(errors.value).length === 0
    }

    const handleRegister = async () => {
        if (!validateForm()) return
        loading.value = true
        try {
            await userApi.register(userData.value)
            router.push('/login')
        }
        catch (error) {
            const err = handleApiError(error)
            errors.value.general = err.message
        }
        finally {
            loading.value = false
        }
    }

</script>