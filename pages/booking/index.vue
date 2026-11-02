<script setup lang="ts">
import { ArrowRight, CalendarDays, Search, ShieldCheck } from 'lucide-vue-next';
import { publicApi } from '~/api/factories/publicApi';
definePageMeta({ layout: false });
useCustomerTheme();
useSeoMeta({ title: 'Track your booking', robots: 'noindex' });
const phone = ref('');
const reference = ref('');
const loading = ref(false);
const error = ref('');
const results = ref<Awaited<ReturnType<typeof publicApi.lookupBooking>>>([]);
async function findBooking() {
  error.value = '';
  results.value = [];
  if (!/^(?:234|0)?[789][01]\d{8}$/.test(phone.value.replace(/\D/g, ''))) { error.value = 'Enter the Nigerian phone number used for the booking.'; return; }
  if (reference.value.trim().length < 4) { error.value = 'Enter the booking reference from your confirmation.'; return; }
  loading.value = true;
  try { results.value = await publicApi.lookupBooking(phone.value, reference.value.trim()); }
  catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
function when(value: string, timezone: string) {
  return new Date(value).toLocaleString('en-NG', { timeZone: timezone, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
</script>

<template>
  <div class="min-h-dvh bg-canvas px-4 py-8 text-ink">
    <div class="mx-auto max-w-xl">
      <NuxtLink to="/" class="inline-flex items-center gap-2"><LogoMark /></NuxtLink>
      <div class="mt-8 rounded-[2rem] border border-line bg-surface p-6 shadow-lift sm:p-8">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Search class="h-5 w-5" /></div>
        <p class="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">Booking lookup</p>
        <h1 class="mt-1 font-display text-3xl font-bold tracking-tight">Track your appointment.</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">Find your booking to cancel, reschedule, pay a balance or add it to your calendar.</p>
        <form class="mt-5 space-y-3" @submit.prevent="findBooking">
          <BaseInput v-model="phone" label="Phone number used" type="tel" placeholder="0803 123 4567" required />
          <BaseInput v-model="reference" label="Booking reference" placeholder="BKG-0003" required />
          <BaseButton type="submit" block :loading="loading">Find my booking <ArrowRight class="h-4 w-4" /></BaseButton>
        </form>
        <p v-if="error" class="mt-3 rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ error }}</p>
        <div v-if="results.length" class="mt-5 space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Matched bookings</p>
          <NuxtLink v-for="booking in results" :key="booking.publicToken" :to="`/booking/${booking.publicToken}`" class="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 transition hover:border-brand-300 hover:bg-brand-50/40">
            <div class="min-w-0"><p class="truncate text-sm font-bold">{{ booking.serviceName }}</p><p class="mt-0.5 text-[10px] text-muted">{{ booking.businessName }} · {{ when(booking.startAt, booking.timezone) }}</p><p class="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted">{{ booking.status }} · {{ booking.paymentStatus.replace('_', ' ') }}</p></div>
            <CalendarDays class="h-4 w-4 shrink-0 text-brand-600" />
          </NuxtLink>
        </div>
        <div class="mt-5 flex items-start gap-2 rounded-xl bg-raised/60 p-3 text-[10px] leading-relaxed text-muted"><ShieldCheck class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><p>We require both the phone number and booking reference so your appointment record stays private.</p></div>
      </div>
    </div>
  </div>
</template>
