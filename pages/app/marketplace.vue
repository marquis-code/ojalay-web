<script setup lang="ts">
import { ArrowRight, QrCode, ShieldCheck, TrendingUp } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Campus marketplace' });
const { data, loading, load } = useMarketplaceMine();
const businessStore = useBusinessStore();
const isVerified = computed(() => Boolean(businessStore.business?.campusVerified));
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Campus marketplace" subtitle="Bookings that came from Ojaly's UNILAG/CMUL discovery — with your GMV and commission." eyebrow="Demand">
      <template #actions><BaseButton to="/app/share" variant="outline"><QrCode class="h-4 w-4" /> Share shop</BaseButton></template>
    </PageHeader>
    <div v-if="!isVerified" class="card border-warning/30 bg-warning/5 p-5"><div class="flex items-start gap-3"><ShieldCheck class="mt-0.5 h-5 w-5 text-warning" /><div><p class="font-bold">Your business is not verified for the campus marketplace yet.</p><p class="mt-1 text-xs leading-relaxed text-muted">Verification is what makes students trust the listing. Our campus team reviews the business, services and campus. You can still share your normal shop link today.</p></div></div></div>
    <div v-else class="card border-success/20 bg-success/5 p-4 text-xs font-semibold text-success"><ShieldCheck class="mr-1 inline h-4 w-4" /> Verified campus business. Your services are eligible for discovery.</div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Marketplace bookings</p><p class="mt-1 font-display text-2xl font-bold">{{ data?.summary.bookings || 0 }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">GMV</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(data?.summary.gmvKobo) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Platform commission</p><p class="mt-1 font-display text-2xl font-bold text-brand-600">{{ formatNaira(data?.summary.commissionKobo) }}</p></div>
    </div>

    <BaseCard>
      <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Marketplace bookings</h2><span class="text-[10px] text-muted">{{ data?.summary.completed || 0 }} completed</span></div>
      <div v-if="loading" class="mt-3 space-y-2"><div v-for="i in 3" :key="i" class="skeleton h-14 rounded-xl" /></div>
      <div v-else-if="data?.bookings.length" class="mt-3 divide-y divide-line"><NuxtLink v-for="booking in data.bookings" :key="booking.id" :to="`/app/bookings?date=${booking.startAt.slice(0,10)}`" class="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><div><p class="font-bold">{{ booking.customerName }} · {{ booking.serviceName }}</p><p class="text-[10px] text-muted">{{ formatDate(booking.startAt) }} · {{ booking.bookingNumber }} · {{ booking.campus }}</p></div><div class="text-right"><p class="font-bold">{{ formatNaira(booking.priceKobo) }}</p><p class="text-[10px] text-muted">fee {{ formatNaira(booking.feeKobo) }}</p></div></NuxtLink></div>
      <div v-else class="mt-4 rounded-2xl border border-dashed border-line p-6 text-center"><TrendingUp class="mx-auto h-6 w-6 text-muted" /><p class="mt-2 text-sm font-bold">No marketplace bookings yet.</p><p class="mt-1 text-xs text-muted">Get verified, add your services and share your link. When a student books from the campus marketplace, it appears here.</p><NuxtLink to="/campus" class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600">See the marketplace <ArrowRight class="h-3 w-3" /></NuxtLink></div>
    </BaseCard>
  </div>
</template>
