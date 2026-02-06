<template>
  <BaseCard>
    <h3 class="text-lg font-semibold mb-4">Confirm Transfer</h3>
    <div class="mb-4">
      <p><strong>To:</strong> {{ recipient.fullName }}</p>
      <p><strong>Amount:</strong> ₦{{ formatAmount(amount) }}</p>
      <p><strong>Description:</strong> {{ description || 'No description' }}</p>
      <p><strong>Fee:</strong> ₦0.00</p>
      <p><strong>Total:</strong> ₦{{ formatAmount(amount) }}</p>
    </div>
    <PinInput @complete="pin = $event" />
    <div class="flex gap-4 mt-4">
      <BaseButton variant="secondary" @click="$emit('cancel')">Cancel</BaseButton>
      <BaseButton @click="confirmTransfer" :disabled="!pin">Confirm</BaseButton>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import BaseCard from './base/BaseCard.vue'
import BaseButton from './base/BaseButton.vue'
import PinInput from './PinInput.vue'

const emit = defineEmits(['confirm', 'cancel'])

const props = defineProps({
  recipient: { type: Object, required: true },
  amount: { type: Number, required: true },
  description: String
})

const transactionStore = useTransactionStore()
const pin = ref('')

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const confirmTransfer = async () => {
  try {
    await transactionStore.createTransfer({
      recipientId: props.recipient.id,
      amount: props.amount,
      description: props.description,
      pin: pin.value
    })
    emit('confirm')
  } catch (error) {
    console.error('Transfer failed:', error)
  }
}
</script>