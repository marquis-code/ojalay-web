<script setup lang="ts">
import { ArrowRight, BadgeCheck, CalendarCheck, Check, Repeat2, Search, ShieldCheck } from 'lucide-vue-next';
const points = [
  {
    icon: Search, number: '01', label: 'The discovery question',
    question: '“Where do customers find me when they’re not already in my DMs?”',
    answer: 'Ojaly puts verified local service providers in front of customers across Lagos, with UNILAG and CMUL as launch communities. Discovery becomes demand — not another link you have to push alone.',
    outcome: 'Get found by customers who are ready to book',
  },
  {
    icon: CalendarCheck, number: '02', label: 'The booking question',
    question: '“How do I stop WhatsApp bookings from clashing?”',
    answer: 'Live availability, buffers and deposits. A customer picks a real slot, pays a deposit and gets a confirmation. Your calendar stays honest and no-shows cost less.',
    outcome: 'A calendar that cannot double-book you',
  },
  {
    icon: ShieldCheck, number: '03', label: 'The trust question',
    question: '“Why should a customer pay me before meeting me?”',
    answer: 'A verified campus badge, reviews from completed appointments and a receipt after every payment. Trust is visible before the first message.',
    outcome: 'Look legitimate from the first tap',
  },
  {
    icon: Repeat2, number: '04', label: 'The repeat question',
    question: '“How do I turn one client into five bookings?”',
    answer: 'Packages, memberships and automatic reminders turn a one-off appointment into repeat income. The customer, payment and next booking stay linked.',
    outcome: 'A customer record that compounds',
  },
];
</script>

<template>
  <section class="border-b border-line bg-surface py-16 sm:py-24">
    <div class="shell">
      <div class="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <p class="eyebrow">The system problem</p>
          <h2 class="mt-3 max-w-2xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Informal commerce runs on conversations. Ojaly turns the transaction into a system.</h2>
        </div>
        <p class="max-w-md text-sm leading-relaxed text-muted">Not another dashboard. Not another free website. A demand and booking layer where every real appointment creates a customer, a payment, a receipt and a reputation.</p>
      </div>

      <div class="mt-10 grid gap-4 md:grid-cols-2">
        <article v-for="point in points" :key="point.number" class="group rounded-3xl border border-line bg-canvas p-5 transition hover:border-ink sm:p-6">
          <div class="flex items-start justify-between gap-3"><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-900 text-accent"><component :is="point.icon" class="h-5 w-5" /></span><span class="font-display text-3xl font-bold text-line">{{ point.number }}</span></div>
          <p class="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">{{ point.label }}</p>
          <h3 class="mt-2 font-display text-xl font-bold leading-snug">{{ point.question }}</h3>
          <p class="mt-3 text-[13px] leading-relaxed text-muted">{{ point.answer }}</p>
          <p class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[10px] font-bold text-success"><Check class="h-3.5 w-3.5" /> {{ point.outcome }}</p>
        </article>
      </div>

      <div class="mt-8 flex flex-col gap-4 rounded-3xl border-2 border-ink bg-accent p-5 text-forest-900 shadow-chunky-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-900/60">Now live in Lagos</p><p class="mt-1 font-display text-xl font-bold">UNILAG and CMUL. Service businesses first.</p><p class="mt-1 text-xs text-forest-900/70">Hair, food, nails, printing, laundry, design, repairs and tutoring.</p></div>
        <div class="flex flex-wrap gap-2"><BaseButton to="/marketplace" variant="dark">Browse marketplace <ArrowRight class="h-4 w-4" /></BaseButton><BaseButton to="/register?campus=UNILAG" variant="ghost" class="!text-forest-900">List your service</BaseButton></div>
      </div>
    </div>
  </section>
</template>
