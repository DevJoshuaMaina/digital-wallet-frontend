<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
    <nav class="flex justify-between p-6">
      <h1 class="text-2xl font-bold">Digital Wallet</h1>
      <div>
        <router-link to="/login" class="mr-4">LOGIN</router-link>
        <router-link to="/register" class="btn-primary">REGISTER</router-link>
      </div>
    </nav>
    <section class="text-center py-20">
      <h1 class="text-5xl font-bold mb-4">A Simplified Digital Wallet</h1>
      <p class="text-xl mb-8">Manage your money online with ease</p>
      <router-link to="/register" class="btn-primary text-lg px-8 py-3">Get Transacting</router-link>
    </section>
  </div>
</template>