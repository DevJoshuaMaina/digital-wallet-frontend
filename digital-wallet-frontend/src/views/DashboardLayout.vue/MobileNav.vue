<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around">
    <router-link to="/dashboard" class="flex min-h-11 min-w-14 flex-col items-center justify-center p-2">
      <span class="text-xl">D</span>
      <span class="text-sm">Dashboard</span>
    </router-link>
    <router-link to="/transfer" class="flex min-h-11 min-w-14 flex-col items-center justify-center p-2">
      <span class="text-xl">T</span>
      <span class="text-sm">Transfer</span>
    </router-link>
    <router-link to="/transactions" class="flex min-h-11 min-w-14 flex-col items-center justify-center p-2">
      <span class="text-xl">H</span>
      <span class="text-sm">History</span>
    </router-link>
    <router-link to="/requests" class="flex min-h-11 min-w-14 flex-col items-center justify-center p-2">
      <span class="text-xl">R</span>
      <span class="text-sm">Requests</span>
    </router-link>
    <router-link to="/profile" class="flex min-h-11 min-w-14 flex-col items-center justify-center p-2">
      <span class="text-xl">P</span>
      <span class="text-sm">Profile</span>
    </router-link>
  </nav>
</template>
