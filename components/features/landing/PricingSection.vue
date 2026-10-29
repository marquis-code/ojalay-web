<script setup lang="ts">
import { ArrowRight, Check, ShieldCheck, Sparkles, Users } from 'lucide-vue-next';
</script>

<template>
  <section id="pricing" class="border-b border-line py-16 sm:py-24">
    <div class="shell">
      <div class="mx-auto max-w-3xl text-center">
        <p class="eyebrow">Pricing that starts at zero</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Free to list. We earn when we bring you a paying customer.</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">No monthly fee to be discovered. No fee on customers you bring yourself. A success fee only on bookings Ojaly sources for you.</p>
      </div>
      <div class="mt-10 grid gap-4 lg:grid-cols-3">
        <div class="flex flex-col rounded-3xl border border-line bg-surface p-6 sm:p-7">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Sparkles class="h-5 w-5" /></div>
          <h3 class="mt-5 font-display text-2xl font-bold">Customers</h3>
          <p class="mt-1 text-xs leading-relaxed text-muted">For anyone booking a local service.</p>
          <p class="mt-5 font-display text-4xl font-bold">Free</p>
          <ul class="mt-5 flex-1 space-y-2 text-[13px] text-muted"><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Browse verified providers</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Book and pay securely</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Receipt and booking management</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Reviews and rebooking</li></ul>
          <BaseButton to="/marketplace" variant="outline" block class="mt-6">Browse marketplace <ArrowRight class="h-4 w-4" /></BaseButton>
        </div>
        <div class="relative flex flex-col rounded-3xl border-2 border-ink bg-forest-900 p-6 text-white shadow-[8px_8px_0_0_#FF5A1F] sm:p-7">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-forest-900">Built for service businesses</div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent"><ShieldCheck class="h-5 w-5" /></div>
          <h3 class="mt-5 font-display text-2xl font-bold">Service business</h3>
          <p class="mt-1 text-xs leading-relaxed text-[#A8C0B4]">Get discovered and fill your calendar.</p>
          <p class="mt-5 font-display text-4xl font-bold">Free to list</p>
          <p class="mt-1 text-[11px] text-[#A8C0B4]">+ 5% on marketplace-sourced bookings</p>
          <ul class="mt-5 flex-1 space-y-2 text-[13px] text-[#D5E4DB]"><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Verified profile and services</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Live availability, deposits and receipts</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Reviews, packages and reminders</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-accent" /> 0% fee on customers you bring directly</li></ul>
          <BaseButton to="/register" variant="secondary" block class="mt-6">List your service free <ArrowRight class="h-4 w-4" /></BaseButton>
        </div>
        <div class="flex flex-col rounded-3xl border border-line bg-surface p-6 sm:p-7">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-raised text-muted"><Users class="h-5 w-5" /></div>
          <h3 class="mt-5 font-display text-2xl font-bold">Growing teams</h3>
          <p class="mt-1 text-xs leading-relaxed text-muted">Optional tools for bigger operations.</p>
          <p class="mt-5 font-display text-xl font-bold">Paid plans, when they make sense</p>
          <ul class="mt-5 flex-1 space-y-2 text-[13px] text-muted"><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Extra staff seats</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Advanced exports and reporting</li><li class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /> Product, stock and multi-service operations</li></ul>
          <BaseButton to="/register" variant="outline" block class="mt-6">Start free</BaseButton>
        </div>
      </div>
      <p class="mt-6 text-center text-[11px] leading-relaxed text-muted">Marketplace fees are recorded on every Ojaly-sourced booking. No card needed to list. Customers never pay a subscription.</p>
    </div>
  </section>
</template>
