<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-dvh lg:h-dvh lg:overflow-hidden grid lg:grid-cols-[1.05fr_1fr]">
    <!-- Left Hero/Branding Column: Fixed on viewport, never scrolls -->
    <section class="relative hidden overflow-hidden bg-forest-900 p-10 text-white lg:flex lg:flex-col lg:justify-between lg:h-full lg:overflow-hidden xl:p-14">
      <div class="absolute inset-0 grid-paper opacity-20" />
      <div class="absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-500/90" />
      <div class="absolute bottom-24 right-32 h-20 w-20 rotate-12 rounded-3xl bg-brand-500/80" />
      <div class="relative">
        <NuxtLink to="/" aria-label="Ojaly home"><LogoMark dark size="lg" /></NuxtLink>
      </div>
      <div class="relative max-w-xl">
        <p class="mb-4 inline-flex rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A8C0B4]">Lagos local services · campus &amp; community</p>
        <h1 class="font-display text-5xl font-bold leading-[0.98] tracking-[-0.05em] xl:text-6xl">Be found.<br><span class="text-brand-300">Be booked. Be trusted.</span></h1>
        <p class="mt-5 max-w-md text-base leading-relaxed text-[#BFD2C7]">List your services or products, take bookings and payments, and turn every customer into a record — whether you are on campus or in the community.</p>
        <div class="mt-9 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
          <p class="text-sm leading-relaxed text-[#E4EEE8]">“Ojaly put my business in front of customers who were ready to book. The deposit alone changed my no-shows.”</p>
          <div class="mt-4 flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/80 font-bold text-forest-900">KC</span>
            <div><p class="text-sm font-bold">Kola A.</p><p class="text-[11px] text-[#8CAB99]">Barber · Yaba, Lagos</p></div>
          </div>
        </div>
      </div>
      <p class="relative text-xs text-[#7C9989]">Lagos first. Campus and community. No jargon.</p>
    </section>

    <!-- Right Form Column: Scrollable independently without moving the page -->
    <section class="flex flex-col bg-canvas lg:h-full lg:overflow-y-auto">
      <div class="sticky top-0 z-20 flex items-center justify-between border-b border-line/40 bg-canvas/90 px-5 py-4 backdrop-blur-md sm:px-7">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Home</NuxtLink>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <div class="lg:hidden"><LogoMark /></div>
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div class="w-full max-w-md"><slot /></div>
      </div>
      <p class="px-5 pb-6 text-center text-[11px] text-muted sm:px-8">By continuing you agree to Ojaly's fair-use terms. Your data belongs to you.</p>
    </section>
  </div>
</template>
