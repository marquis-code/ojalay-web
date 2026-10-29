<script setup lang="ts">
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-vue-next';
</script>

<template>
  <section class="border-y border-line bg-forest-900 px-4 py-10 text-white sm:px-6">
    <div class="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="max-w-2xl">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-accent"><Sparkles class="h-3 w-3" /> Lagos campus pilot</span>
        <h2 class="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Book verified local service businesses in Lagos.</h2>
        <p class="mt-1 text-sm leading-relaxed text-white/60">Hair, food, nails, printing, laundry, design and repairs — discover trusted providers, book a time and pay securely.</p>
      </div>
      <div class="flex flex-wrap gap-2"><NuxtLink to="/campus" class="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white">Browse the marketplace <ArrowRight class="h-4 w-4" /></NuxtLink><NuxtLink to="/register?campus=UNILAG" class="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-bold text-white"><ShieldCheck class="h-4 w-4" /> List your service</NuxtLink></div>
    </div>
  </section>
</template>
