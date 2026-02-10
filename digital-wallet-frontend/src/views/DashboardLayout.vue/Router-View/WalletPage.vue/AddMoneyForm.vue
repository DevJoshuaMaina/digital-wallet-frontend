<template>
  <BaseCard title="Add Money">
    <form @submit.prevent="handleSubmit">
      <BaseInput v-model="amount" type="number" label="Amount" placeholder="Enter amount" :error="errors.amount"/>
      <BaseSelect v-model="paymentMethod" :options="paymentOptions" label="Payment Method"/>
      <BaseInput v-model="description" label="Description" placeholder="Optional description"/>
      <BaseButton type="submit" :loading="loading" class="w-full mt-4">Add Money</BaseButton>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import walletApi from '@/services/walletApi'
import { handleApiError } from '@/utils/errorHandler'
import BaseCard from './base/BaseCard.vue'
import BaseInput from './base/BaseInput.vue'
import BaseSelect from './base/BaseSelect.vue'
import BaseButton from './base/BaseButton.vue'

const emit = defineEmits(['success'])

const userStore = useUserStore()
const amount = ref('')
const paymentMethod = ref('card')
const description = ref('')
const errors = ref({})
const loading = ref(false)

const paymentOptions = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank', label: 'Bank Transfer' }
]

const handleSubmit = async () => {
  if (!amount.value) {
    errors.value.amount = 'Amount is required'
    return
  }
  loading.value = true
  try {
    await walletApi.addMoney(userStore.wallet.id, {
      amount: parseFloat(amount.value),
      paymentMethod: paymentMethod.value,
      description: description.value
    })
    emit('success')
  } 
  catch (error) {
    const err = handleApiError(error)
    errors.value.amount = err.message
  } 
  finally {
    loading.value = false
  }
}
</script>