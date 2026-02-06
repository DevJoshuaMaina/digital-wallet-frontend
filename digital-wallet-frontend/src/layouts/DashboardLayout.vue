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
import TopBar from '@/views/DashboardLayout.vue/TopBar.vue'
import Sidebar from '@/views/DashboardLayout.vue/Sidebar.vue'
import MobileNav from '@/views/DashboardLayout.vue/MobileNav.vue'
</script>
