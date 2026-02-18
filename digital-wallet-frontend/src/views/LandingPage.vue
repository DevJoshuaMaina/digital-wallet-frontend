<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
    <nav class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center p-6">
      <h1 class="text-2xl font-bold text-center sm:text-left">Digital Wallet</h1>
      <div class="text-center sm:text-right">
        <router-link to="/login" class="mr-4">LOGIN</router-link>
        <router-link to="/register" class="btn-primary">REGISTER</router-link>
      </div>
    </nav>
    <section class="text-center py-16 px-4 sm:py-20">
      <h1 class="text-3xl sm:text-5xl font-bold mb-4">A Simplified Online Digital Wallet</h1>
      <p class="text-lg sm:text-xl mb-8">Manage your money online with ease</p>
      <router-link to="/register" class="btn-primary text-lg px-8 py-3">Start Transacting</router-link>
    </section>
  </div>
</template>
