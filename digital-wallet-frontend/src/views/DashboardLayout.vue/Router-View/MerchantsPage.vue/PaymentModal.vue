<template>
  <BaseModal :show="true" :title="`Pay ${merchant.name}`" @close="$emit('close')">
    <form @submit.prevent="handlePayment">
      <AmountInput v-model="amount" :max="10000" />
      <BaseInput v-model="description" label="Description" class="mt-4" />
      <PinInput @complete="pin = $event" class="mt-4" />
      <BaseButton type="submit" :loading="loading" class="w-full mt-4" :disabled="!pin">Pay</BaseButton>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import BaseModal from '@/components/base/BaseModal.vue'
import AmountInput from './AmountInput.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PinInput from './PinInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const emit = defineEmits(['close', 'success', 'error'])

const props = defineProps({
  merchant: { type: Object, required: true }
})

const transactionStore = useTransactionStore()
const amount = ref(0)
const description = ref('')
const pin = ref('')
const loading = ref(false)

const handlePayment = async () => {
  loading.value = true
  try {
    await transactionStore.createMerchantPayment({
      merchantId: props.merchant.id,
      amount: amount.value,
      description: description.value,
      pin: pin.value
    })
    emit('success')
  }
  catch (error) {
    emit('error', error)
  }
  finally {
    loading.value = false
  }
}
</script>
