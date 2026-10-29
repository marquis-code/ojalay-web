<script setup lang="ts">
import { ArrowRight, MessageCircle } from 'lucide-vue-next';
const auth = useAuthStore();
</script>

<template>
  <section class="relative overflow-hidden bg-brand-500 py-16 text-white sm:py-24">
    <div class="absolute inset-0 grid-paper opacity-20" />
    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[30px] border-forest-900/20" />
    <div class="shell relative text-center">
      <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Lagos local services · campus &amp; community</p>
      <h2 class="mx-auto mt-4 max-w-3xl text-balance font-display text-5xl font-bold tracking-[-0.05em] sm:text-7xl">Be found.<br><span class="text-forest-900">Be booked. Be trusted.</span></h2>
      <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">Customers get a trusted way to book. Service businesses get demand, deposits and a record that proves the business is real. Start with your campus.</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <BaseButton to="/campus" variant="dark" size="lg">Browse the marketplace <ArrowRight class="h-5 w-5" /></BaseButton>
        <BaseButton :to="auth.isAuthenticated ? '/app' : '/register?campus=UNILAG'" variant="secondary" size="lg">{{ auth.isAuthenticated ? 'Open dashboard' : 'List your service free' }}</BaseButton>
      </div>
      <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white/80"><MessageCircle class="h-4 w-4" /> Talk to the campus team</a>
    </div>
  </section>
</template>
