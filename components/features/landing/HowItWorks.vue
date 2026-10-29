<script setup lang="ts">
import { BadgeCheck, CalendarCheck, Compass, CreditCard, Repeat2, Scissors } from 'lucide-vue-next';
const customer = [
  { icon: Compass, title: 'Discover a verified business', body: 'Browse Lagos providers by service, category and rating. Every listing is reviewed.' },
  { icon: CalendarCheck, title: 'Book a real time', body: 'Pick a live slot. The business sees it immediately, and you get a confirmation.' },
  { icon: CreditCard, title: 'Pay securely. Get a receipt.', body: 'Deposit or full payment through Paystack. Your booking, receipt and management link are created automatically.' },
];
const owner = [
  { icon: BadgeCheck, title: 'Get verified', body: 'Add your campus, services and prices. Our team reviews the business before it appears.' },
  { icon: Scissors, title: 'Publish your service menu', body: 'Durations, prices, deposits, add-ons, packages and team schedules in one place.' },
  { icon: Repeat2, title: 'Get paid. Build the record.', body: 'Every booking creates a customer, payment, receipt and review request. Rebook with packages and reminders.' },
];
</script>

<template>
  <section id="how" class="border-b border-line bg-forest-900 py-16 text-white sm:py-24">
    <div class="shell">
      <div class="max-w-2xl">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">One system. Two sides.</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The customer finds you. Ojaly keeps the record.</h2>
        <p class="mt-3 text-sm leading-relaxed text-white/60">No new behaviour for the customer. No retyping for the business. The transaction does the work.</p>
      </div>
      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">For customers</p>
          <div class="mt-5 space-y-4">
            <div v-for="(step, index) in customer" :key="step.title" class="flex gap-3">
              <div class="flex flex-col items-center"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-forest-900"><component :is="step.icon" class="h-4 w-4" /></span><span v-if="index < customer.length - 1" class="mt-1 h-full w-px bg-white/15" /></div>
              <div><p class="text-sm font-bold">{{ step.title }}</p><p class="mt-1 text-xs leading-relaxed text-white/55">{{ step.body }}</p></div>
            </div>
          </div>
          <BaseButton to="/marketplace" variant="secondary" class="mt-6">Browse the marketplace</BaseButton>
        </div>
        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">For service businesses</p>
          <div class="mt-5 space-y-4">
            <div v-for="(step, index) in owner" :key="step.title" class="flex gap-3">
              <div class="flex flex-col items-center"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent"><component :is="step.icon" class="h-4 w-4" /></span><span v-if="index < owner.length - 1" class="mt-1 h-full w-px bg-white/15" /></div>
              <div><p class="text-sm font-bold">{{ step.title }}</p><p class="mt-1 text-xs leading-relaxed text-white/55">{{ step.body }}</p></div>
            </div>
          </div>
          <BaseButton to="/register?campus=UNILAG" variant="secondary" class="mt-6">List your service free</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
