<template>
  <div class="min-h-screen bg-gray-50">
    <TopBar />
    <div class="flex">
      <Sidebar class="hidden md:block" />
      <MobileNav class="md:hidden" />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import TopBar from '@/components/TopBar.vue'
import Sidebar from '@/components/Sidebar.vue'
import MobileNav from '@/components/MobileNav.vue'
</script>