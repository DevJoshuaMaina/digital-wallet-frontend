<template>
  <BaseCard>
    <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
    <div class="grid grid-cols-2 gap-4">
      <QuickActionButton icon="💸" label="Send Money" @click="$emit('transfer')" />
      <QuickActionButton icon="💰" label="Add Money" @click="$emit('add-money')" />
      <QuickActionButton icon="🏪" label="Pay Merchant" @click="$emit('pay-merchant')" />
      <QuickActionButton icon="📱" label="Request Money" @click="$emit('request-money')" />
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './base/BaseCard.vue'
import QuickActionButton from './QuickActionButton.vue'

defineEmits(['transfer', 'add-money', 'pay-merchant', 'request-money'])
</script>