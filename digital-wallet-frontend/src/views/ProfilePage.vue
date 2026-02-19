<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Profile Settings</h1>
    <BaseAlert v-if="errors.general" type="error" :message="errors.general" />
    <EmptyState v-if="!userStore.currentUser" message="No profile data available. Please login again." icon="👤" />
    <template v-else>
    
    <!-- User Info -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">User Information</h3>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-600">Username</p>
          <p class="font-medium">{{ userStore.currentUser?.username }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Email</p>
          <p class="font-medium">{{ userStore.currentUser?.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Full Name</p>
          <p class="font-medium">{{ userStore.currentUser?.fullName }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Phone</p>
          <p class="font-medium">{{ userStore.currentUser?.phoneNumber }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Member Since</p>
          <p class="font-medium">{{ formatDate(userStore.currentUser?.createdAt) }}</p>
        </div>
      </div>
    </BaseCard>
    
    <!-- Edit Profile -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Edit Profile</h3>
      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <BaseInput v-model="profileForm.fullName" label="Full Name" :error="errors.fullName" placeholder="Enter your full name"/>
        <BaseInput v-model="profileForm.email" type="email" label="Email" :error="errors.email" placeholder="Enter your email"/>
        <BaseInput v-model="profileForm.phoneNumber" type="tel" label="Phone Number" :error="errors.phoneNumber" placeholder="Enter your phone number"/>
        <BaseButton type="submit" variant="primary" :loading="loading">Update Profile</BaseButton>
      </form>
    </BaseCard>
    
    <!-- Account Actions -->
    <BaseCard>
      <h3 class="text-lg font-semibold mb-4">Account Actions</h3>
      <div class="space-y-2">
        <BaseButton variant="danger" @click="handleLogout">Logout</BaseButton>
      </div>
    </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import userApi from '@/services/userApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()

const profileForm = ref({
  fullName: '',
  email: '',
  phoneNumber: ''
})
const errors = ref({})
const loading = ref(false)

onMounted(() => {
  if (userStore.currentUser) {
    profileForm.value = {
      fullName: userStore.currentUser.fullName,
      email: userStore.currentUser.email,
      phoneNumber: userStore.currentUser.phoneNumber
    }
  }
})

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

async function handleUpdateProfile() {
  if (!userStore.currentUser?.id) {
    errors.value = { general: 'User profile is not available. Please login again.' }
    return
  }

  loading.value = true
  errors.value = {}
  
  try {
    const response = await userApi.updateUser(userStore.currentUser.id, profileForm.value)
    userStore.setUser(response?.data || response)
    toastStore.success('Profile updated successfully.')
  }
  catch (error) {
    const apiError = handleApiError(error)
    errors.value = { ...apiError.fieldErrors, general: apiError.message }
    toastStore.error(apiError.message)
  }
  finally {
    loading.value = false
  }
}

function handleLogout() {
  userStore.logout()
  toastStore.info('You have been logged out.')
  router.push('/login')
}
</script> 
