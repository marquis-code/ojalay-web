<script setup lang="ts">
import { ArrowUpRight, BadgeCheck, BarChart3, CalendarCheck, CreditCard, MessageCircle, PackageCheck, Receipt, Repeat2, Star } from 'lucide-vue-next';
const features = [
  { icon: BadgeCheck, title: 'Verified local demand', body: 'Customers discover only businesses the Ojaly team has reviewed. Trust is built into the listing.' },
  { icon: CalendarCheck, title: 'Real availability', body: 'Live slots, buffers, breaks and time off. A booking cannot collide with another one.' },
  { icon: CreditCard, title: 'Deposits before the appointment', body: 'Paystack deposits reduce no-shows and settle to the business. The customer gets a receipt.' },
  { icon: PackageCheck, title: 'Packages & memberships', body: 'Sell prepaid sessions, deduct them on booking and turn one client into repeat revenue.' },
  { icon: Star, title: 'Reviews tied to real appointments', body: 'Only completed bookings can review. Good work compounds; bad experiences are visible.' },
  { icon: Repeat2, title: 'Rebook & retain', body: 'Customer history, reminders and a one-tap rebook path keep the relationship alive.' },
];
</script>

<template>
  <section id="features" class="border-b border-line py-16 sm:py-24">
    <div class="shell">
      <div class="max-w-2xl">
        <p class="eyebrow">What Ojaly does</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">A booking that becomes a business record.</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted sm:text-base">The customer books. Ojaly creates the customer, deposit, receipt, review request and repeat opportunity. No extra data entry.</p>
      </div>
      <div class="mt-10 grid gap-4 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-forest-900 p-7 text-white lg:col-span-2">
          <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-500/25 blur-2xl" />
          <div class="relative flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-accent"><Receipt class="h-3.5 w-3.5" /> The trusted record</div>
          <h3 class="relative mt-4 max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">One appointment creates the whole chain.</h3>
          <div class="relative mt-6 grid gap-2 sm:grid-cols-4">
            <div v-for="item in [{ label: 'Customer', value: 'Ada Nwosu' }, { label: 'Service', value: 'Knotless braids' }, { label: 'Payment', value: '₦5,000 deposit' }, { label: 'Next step', value: 'Receipt + review' }]" :key="item.label" class="rounded-xl border border-white/10 bg-white/5 p-3"><p class="text-[8px] font-bold uppercase tracking-wider text-white/40">{{ item.label }}</p><p class="mt-1 text-xs font-bold">{{ item.value }}</p></div>
          </div>
          <div class="relative mt-5 flex flex-wrap gap-2 text-[9px] font-semibold text-white/50"><span class="rounded-full border border-white/10 px-2.5 py-1">Verified business</span><span class="rounded-full border border-white/10 px-2.5 py-1">Deposit paid</span><span class="rounded-full border border-white/10 px-2.5 py-1">Receipt issued</span><span class="rounded-full border border-white/10 px-2.5 py-1">Review requested</span><span class="rounded-full border border-white/10 px-2.5 py-1">Rebook link</span></div>
        </div>
        <div class="flex flex-col justify-between rounded-[2rem] border border-line bg-accent p-6 text-forest-900">
          <div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-900/50">For the owner</p><h3 class="mt-2 font-display text-2xl font-bold leading-tight">GMV, commission and repeat customers in one dashboard.</h3></div>
          <div class="mt-5 space-y-2 text-xs font-semibold"><p class="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2"><span>Marketplace bookings</span><span>18</span></p><p class="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2"><span>GMV</span><span>₦240,000</span></p><p class="flex items-center justify-between rounded-lg bg-forest-900 px-3 py-2 text-accent"><span>Repeat customers</span><span>37%</span></p></div>
          <NuxtLink to="/register?campus=UNILAG" class="mt-5 inline-flex items-center gap-1.5 text-xs font-bold">List your service <ArrowUpRight class="h-3.5 w-3.5" /></NuxtLink>
        </div>
        <div v-for="feature in features" :key="feature.title" class="group rounded-3xl border border-line bg-surface p-6 transition hover:border-ink hover:shadow-soft">
          <div class="flex items-center justify-between"><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><component :is="feature.icon" class="h-5 w-5" /></div><ArrowUpRight class="h-4 w-4 text-line transition group-hover:text-brand-500" /></div>
          <h3 class="mt-4 font-display text-lg font-bold tracking-tight">{{ feature.title }}</h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-muted">{{ feature.body }}</p>
        </div>
      </div>
      <p class="mt-6 text-xs text-muted">Selling physical products too? The catalogue, stock and storefront tools still exist — they just do not lead the story anymore.</p>
    </div>
  </section>
</template>
