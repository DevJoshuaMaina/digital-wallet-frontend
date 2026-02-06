<template>
  <BaseCard>
    <div class="text-center">
      <h3 class="text-2xl font-bold text-primary-600">₦{{ formatBalance(wallet.balance) }}</h3>
      <p class="text-gray-600">Wallet Number: {{ wallet.walletNumber }}</p>
      <div class="mt-4">
        <BaseButton @click="$emit('add-money')">Add Money</BaseButton>
        <BaseButton variant="secondary" @click="$emit('transfer')" class="ml-2">Send Money</BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  wallet: { type: Object, required: true }
})

const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-NG').format(balance)
}

defineEmits(['add-money', 'transfer'])
</script>
