<template>
  <BaseCard title="Edit Profile">
    <form @submit.prevent="handleUpdate">
      <BaseInput v-model="formData.fullName" label="Full Name" :error="errors.fullName"/>
      <BaseInput v-model="formData.email" type="email" label="Email" :error="errors.email"/>
      <BaseInput v-model="formData.phoneNumber" type="tel" label="Phone Number"/>
      <BaseButton type="submit" :loading="loading" class="w-full mt-4">Update Profile</BaseButton>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import userApi from '@/services/userApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const emit = defineEmits(['update'])

const props = defineProps({
  user: { type: Object, required: true }
})

const formData = ref({ ...props.user })
const errors = ref({})
const loading = ref(false)

const handleUpdate = async () => {
  loading.value = true
  try {
    const updatedUser = await userApi.updateUser(props.user.id, formData.value)
    emit('update', updatedUser)
  }
  catch (error) {
    const err = handleApiError(error)
    errors.value = err.data || {}
  }
  finally {
    loading.value = false
  }
}
</script>

