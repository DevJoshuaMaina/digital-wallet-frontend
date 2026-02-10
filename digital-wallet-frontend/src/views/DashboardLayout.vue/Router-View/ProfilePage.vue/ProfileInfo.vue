<template>
  <BaseCard title="User Information">
    <div class="space-y-2">
      <p><strong>Full Name:</strong> {{ user.fullName }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Phone:</strong> {{ user.phoneNumber || 'Not provided' }}</p>
      <p><strong>Member Since:</strong> {{ formatDate(user.createdAt) }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './base/BaseCard.vue'

defineProps({
  user: { type: Object, required: true }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}
</script>
