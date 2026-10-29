<script setup lang="ts">
import { ArrowRight, MessageCircle } from 'lucide-vue-next';
const auth = useAuthStore();
</script>

<template>
  <section class="relative overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
    <div class="absolute inset-0 grid-paper opacity-10" />
    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[30px] border-brand-500/25" />
    <div class="shell relative text-center">
      <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">Lagos local services · campus &amp; community</p>
      <h2 class="mx-auto mt-4 max-w-3xl text-balance font-display text-5xl font-bold tracking-[-0.05em] sm:text-7xl">Be found.<br><span class="text-brand-300">Be booked. Be trusted.</span></h2>
      <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">Customers get a trusted way to book. Service businesses get demand, deposits and a record that proves the business is real. Start with your city.</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <BaseButton to="/marketplace" variant="primary" size="lg">Browse the marketplace <ArrowRight class="h-5 w-5" /></BaseButton>
        <BaseButton :to="auth.isAuthenticated ? '/app' : '/register'" variant="light" size="lg">{{ auth.isAuthenticated ? 'Open dashboard' : 'List your service free' }}</BaseButton>
      </div>
      <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white"><MessageCircle class="h-4 w-4" /> Talk to the team</a>
    </div>
  </section>
</template>
