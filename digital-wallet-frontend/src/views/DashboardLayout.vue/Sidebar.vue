<template>
  <aside class="w-64 bg-white shadow-sm p-6">
    <nav>
      <ul class="space-y-2">
        <li><router-link to="/dashboard" class="block p-2 rounded hover:bg-gray-100">Dashboard</router-link></li>
        <li><router-link to="/wallet" class="block p-2 rounded hover:bg-gray-100">Wallet</router-link></li>
        <li><router-link to="/transfer" class="block p-2 rounded hover:bg-gray-100">Transfer</router-link></li>
        <li><router-link to="/merchants" class="block p-2 rounded hover:bg-gray-100">Merchants</router-link></li>
        <li><router-link to="/transactions" class="block p-2 rounded hover:bg-gray-100">Transactions</router-link></li>
        <li><router-link to="/requests" class="block p-2 rounded hover:bg-gray-100">Requests</router-link></li>
        <li><router-link to="/profile" class="block p-2 rounded hover:bg-gray-100">Profile</router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
defineOptions({
  name: 'AppSidebar'
})
</script>
