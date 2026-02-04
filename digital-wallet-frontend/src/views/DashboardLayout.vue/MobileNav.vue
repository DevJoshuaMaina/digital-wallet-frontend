<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around">
    <router-link to="/dashboard" class="flex flex-col items-center p-2">
      <span class="text-xl">🏠</span>
      <span class="text-xs">Dashboard</span>
    </router-link>
    <router-link to="/transfer" class="flex flex-col items-center p-2">
      <span class="text-xl">📤</span>
      <span class="text-xs">Transfer</span>
    </router-link>
    <router-link to="/transactions" class="flex flex-col items-center p-2">
      <span class="text-xl">📊</span>
      <span class="text-xs">History</span>
    </router-link>
    <router-link to="/profile" class="flex flex-col items-center p-2">
      <span class="text-xl">👤</span>
      <span class="text-xs">Profile</span>
    </router-link>
  </nav>
</template>