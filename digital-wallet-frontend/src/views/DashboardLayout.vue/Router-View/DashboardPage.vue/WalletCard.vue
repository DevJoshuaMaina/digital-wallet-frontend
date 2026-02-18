<template>
  <BaseCard>
    <div class="text-center">
      <h3 class="text-2xl font-bold text-primary-600">₦{{ formattedBalance }}</h3>
      <p class="text-gray-600">Wallet Number: {{ walletNumber }}</p>
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
  wallet: {
    type: Object,
    default: () => ({ balance: 0, walletNumber: 'N/A' })
  }
})

const formattedBalance = computed(() =>
  new Intl.NumberFormat('en-NG').format(props.wallet?.balance ?? 0)
)
const walletNumber = computed(() => props.wallet?.walletNumber || 'N/A')

defineEmits(['add-money', 'transfer'])
</script>




