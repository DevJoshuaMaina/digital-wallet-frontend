<template>
  <BaseCard>
    <BaseInput v-model="query" label="Search by Username" placeholder="Enter username" @input="searchUsers"/>
    <div v-if="results.length" class="mt-4">
      <p class="font-semibold mb-2">Select Recipient:</p>
      <div v-for="user in results" :key="user.id" class="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-50" @click="emit('select', user)">
        <p class="font-medium">{{ user.fullName }}</p>
        <p class="text-sm text-gray-500">{{ user.username }}</p>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import userApi from '@/services/userApi'
import BaseCard from './base/BaseCard.vue'
import BaseInput from './base/BaseInput.vue'

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])

const searchUsers = async () => {
  if (query.value.length < 2) return
  try {
    const response = await userApi.searchUsers(query.value)
    results.value = response
  } catch (error) {
    console.error('Error searching users:', error)
  }
}
</script>
