<template>
  <BaseCard>
    <div class="text-center">
      <h3 class="text-3xl font-bold text-primary-600 mb-2">₦{{ formatBalance(wallet.balance) }}</h3>
      <p class="text-gray-600">Current Balance</p>
      <p class="text-sm text-gray-500 mt-2">Wallet: {{ wallet.walletNumber }}</p>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './base/BaseCard.vue'

defineProps({
  wallet: { type: Object, required: true }
})

const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-NG').format(balance)
}
</script>
