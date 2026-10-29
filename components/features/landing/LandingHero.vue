<script setup lang="ts">
import { ArrowRight, BadgeCheck, CalendarCheck, Check, Receipt, Star } from 'lucide-vue-next';
const auth = useAuthStore();
const trust = ['Verified campus businesses', 'Real availability', 'Paystack deposits', 'Reviews after every appointment'];
</script>

<template>
  <section class="relative overflow-hidden border-b border-line bg-canvas">
    <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
    <div class="shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600"><span class="h-1.5 w-1.5 rounded-full bg-brand-500" /> Lagos campus pilot · UNILAG &amp; CMUL</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1.5 text-[10px] font-bold text-accent"><BadgeCheck class="h-3 w-3" /> Verified student businesses</span>
        </div>
        <h1 class="mt-6 max-w-3xl font-display text-[clamp(2.9rem,7vw,5.8rem)] font-bold leading-[0.91] tracking-[-0.06em] text-ink">The trusted way to book student businesses.</h1>
        <p class="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">Ojaly is the booking and payment layer for campus service businesses. Discover verified hair, food, nails, printing, laundry and design businesses — book a real time and pay securely. No DMs. No transfer screenshots. No guessing.</p>
        <div class="mt-7 flex flex-col gap-2 sm:flex-row">
          <BaseButton to="/campus" size="lg">Browse the marketplace <ArrowRight class="h-4 w-4" /></BaseButton>
          <BaseButton :to="auth.isAuthenticated ? '/app' : '/register?campus=UNILAG'" variant="outline" size="lg">{{ auth.isAuthenticated ? 'Open dashboard' : 'List your service free' }}</BaseButton>
        </div>
        <div class="mt-6 grid max-w-xl grid-cols-2 gap-2 text-[11px] font-semibold text-muted sm:grid-cols-4">
          <span v-for="item in trust" :key="item" class="inline-flex items-start gap-1.5"><Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {{ item }}</span>
        </div>
        <p class="mt-5 max-w-xl text-[11px] leading-relaxed text-muted"><strong class="text-ink">For business owners:</strong> get discovered, fill your calendar and turn every booking into a customer, deposit, receipt and review — automatically.</p>
      </div>

      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div class="absolute -inset-2 rotate-2 rounded-[2.2rem] border-2 border-ink bg-accent" />
        <div class="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-surface shadow-[8px_8px_0_0_#06231A]">
          <img src="/images/business/barber.webp" alt="A Nigerian barber serving a customer" class="aspect-[4/5] w-full object-cover" style="object-position: center 32%">
          <div class="absolute inset-x-3 bottom-3 space-y-2">
            <div class="flex items-center gap-2 rounded-xl bg-surface/95 p-2.5 shadow-lg backdrop-blur">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><BadgeCheck class="h-4 w-4" /></span>
              <div class="min-w-0"><p class="text-[10px] font-bold">The Glow Room</p><p class="text-[9px] text-muted">UNILAG · verified · 4.9 ★</p></div>
              <span class="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[8px] font-bold text-success">Verified</span>
            </div>
            <div class="flex items-center gap-2 rounded-xl bg-surface/95 p-2.5 shadow-lg backdrop-blur">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><CalendarCheck class="h-4 w-4" /></span>
              <div class="min-w-0"><p class="text-[10px] font-bold">Booked · Thu 2:30pm</p><p class="text-[9px] text-muted">Knotless braids · deposit paid</p></div>
              <span class="ml-auto text-[9px] font-bold text-brand-600">₦5,000</span>
            </div>
            <div class="flex items-center gap-2 rounded-xl bg-forest-900 p-2.5 text-white shadow-lg">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-accent"><Receipt class="h-4 w-4" /></span>
              <div class="min-w-0"><p class="text-[10px] font-bold">Receipt + record created</p><p class="text-[9px] text-white/60">Customer, payment, review request</p></div>
              <Star class="ml-auto h-3.5 w-3.5 fill-accent text-accent" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-line bg-forest-900 py-2.5 text-white"><div class="marquee-track flex w-max gap-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"><span v-for="i in 2" :key="i" class="flex gap-8"><span>Verified campus businesses</span><span>·</span><span>Book &amp; pay in one flow</span><span>·</span><span>Deposits</span><span>·</span><span>Receipts</span><span>·</span><span>Reviews</span><span>·</span><span>Rebook</span><span>·</span><span>Lagos: UNILAG &amp; CMUL</span><span>·</span></span></div></div>
  </section>
</template>
