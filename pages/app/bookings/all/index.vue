<script setup lang="ts">
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Users } from 'lucide-vue-next';
import { bookingsApi } from '~/api/factories/bookingsApi';
import type { Booking } from '~/types';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'All bookings' });
const toast = useToast();
const items = ref<Booking[]>([]);
const total = ref(0);
const pages = ref(1);
const loading = ref(false);
const filters = reactive({ search: '', status: 'all', from: '', to: '', page: 1, limit: 50 });
const statusOptions = [{ value: 'all', label: 'All statuses' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'no_show', label: 'No-show' }];
const rangeLabel = computed(() => filters.from || filters.to ? 'Custom range' : 'All dates');
let searchTimer: ReturnType<typeof setTimeout> | null = null;
const statusStyle: Record<string, string> = { pending: 'bg-warning/10 text-warning', confirmed: 'bg-success/10 text-success', completed: 'bg-brand-50 text-brand-700', cancelled: 'bg-danger/10 text-danger', no_show: 'bg-raised text-muted' };
function when(value: string) { return new Date(value).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function paymentLabel(value: string) { return value.replace('_', ' '); }
async function load() {
  loading.value = true;
  try {
    const result = await bookingsApi.listBookings({
      search: filters.search.trim() || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: filters.page,
      limit: filters.limit,
      sort: 'desc',
    });
    items.value = result.items;
    total.value = result.meta.total;
    pages.value = result.meta.pages;
  } catch (error) { toast.error((error as Error).message); }
  finally { loading.value = false; }
}
function applyRange(payload: { from: string; to: string }) { filters.from = payload.from; filters.to = payload.to; filters.page = 1; void load(); }
function clearFilters() { filters.search = ''; filters.status = 'all'; filters.from = ''; filters.to = ''; filters.page = 1; void load(); }
function go(delta: number) { if (filters.page + delta < 1 || filters.page + delta > pages.value) return; filters.page += delta; void load(); }
watch(() => filters.status, () => { filters.page = 1; void load(); });
watch(() => filters.search, () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { filters.page = 1; void load(); }, 350); });
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="All bookings" subtitle="Every appointment across every date — not just today." eyebrow="Bookings">
      <template #actions><NuxtLink to="/app/bookings" class="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold"><CalendarDays class="h-4 w-4" /> Day view</NuxtLink><BaseButton to="/app/bookings/new">+ New booking</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Matching bookings</p><p class="mt-1 font-display text-2xl font-bold">{{ total }}</p><p class="text-[10px] text-muted">{{ rangeLabel }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Current filter</p><p class="mt-1 font-display text-2xl font-bold capitalize">{{ filters.status === 'all' ? 'All' : filters.status.replace('_', ' ') }}</p><p class="text-[10px] text-muted">{{ filters.search ? `Search: ${filters.search}` : 'No search applied' }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Page</p><p class="mt-1 font-display text-2xl font-bold">{{ filters.page }} / {{ pages }}</p><p class="text-[10px] text-muted">{{ filters.limit }} per page</p></div>
    </div>

    <div class="card p-3">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div class="relative min-w-0 flex-1"><Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input v-model="filters.search" type="search" placeholder="Search customer, phone, service or booking number…" class="input-base h-10 min-h-0 pl-9 text-xs" aria-label="Search all bookings"></div>
        <div class="w-full shrink-0 lg:w-44"><BaseSelect v-model="filters.status" :options="statusOptions" aria-label="Filter booking status" /></div>
        <div class="w-full shrink-0 lg:w-56"><DateRangePicker :from="filters.from" :to="filters.to" @apply="applyRange" @clear="filters.from = ''; filters.to = ''; filters.page = 1; load()" /></div>
        <button type="button" class="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-bold text-muted" @click="clearFilters"><SlidersHorizontal class="h-3.5 w-3.5" /> Clear</button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-line bg-surface">
      <div class="hidden grid-cols-[150px_minmax(0,1fr)_130px_110px_100px_90px] gap-3 border-b border-line bg-raised/30 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted lg:grid"><span>When</span><span>Customer & service</span><span>Amount</span><span>Payment</span><span>Status</span><span></span></div>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 5" :key="i" class="skeleton h-16 rounded-xl" /></div>
      <BaseEmptyState v-else-if="!items.length" title="No bookings match these filters" message="Try clearing the search or choosing a different date range." action-label="Clear filters" @action="clearFilters" />
      <div v-else class="divide-y divide-line">
        <div v-for="booking in items" :key="booking.id" class="grid gap-2 px-4 py-4 lg:grid-cols-[150px_minmax(0,1fr)_130px_110px_100px_90px] lg:items-center lg:gap-3">
          <div><p class="text-xs font-bold">{{ when(booking.startAt) }}</p><p class="mt-0.5 text-[9px] text-muted">{{ booking.bookingNumber }}</p></div>
          <div class="min-w-0"><p class="truncate text-sm font-bold">{{ booking.customerName }}</p><p class="mt-0.5 truncate text-[11px] text-muted">{{ booking.serviceName }}<span v-if="booking.quantity && booking.quantity > 1"> · {{ booking.quantity }} {{ (booking.quantityLabel || 'units').toLowerCase() }}</span></p><p class="mt-0.5 text-[10px] text-muted">{{ booking.customerPhone }} · {{ booking.providerName }}</p></div>
          <div class="flex items-center justify-between gap-2 lg:block"><span class="text-[9px] font-bold uppercase tracking-wider text-muted lg:hidden">Amount</span><span class="text-sm font-bold">{{ formatNaira(booking.priceKobo) }}</span></div>
          <div class="flex items-center justify-between gap-2 lg:block"><span class="text-[9px] font-bold uppercase tracking-wider text-muted lg:hidden">Payment</span><span class="text-[10px] font-semibold capitalize text-muted">{{ paymentLabel(booking.paymentStatus) }}</span></div>
          <div class="flex items-center justify-between gap-2 lg:block"><span class="text-[9px] font-bold uppercase tracking-wider text-muted lg:hidden">Status</span><span class="inline-flex rounded-full px-2 py-1 text-[9px] font-bold capitalize" :class="statusStyle[booking.status]">{{ booking.status.replace('_', ' ') }}</span></div>
          <div class="flex justify-end"><NuxtLink :to="`/app/bookings?date=${booking.startAt.slice(0, 10)}`" class="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 text-[10px] font-bold">Manage <ArrowUpRight class="h-3 w-3" /></NuxtLink></div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2"><p class="text-[10px] text-muted">Showing {{ items.length }} of {{ total }} bookings</p><div class="flex items-center gap-1"><button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted disabled:opacity-40" :disabled="filters.page <= 1" aria-label="Previous page" @click="go(-1)"><ChevronLeft class="h-4 w-4" /></button><span class="px-2 text-[10px] font-bold">{{ filters.page }} / {{ pages }}</span><button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted disabled:opacity-40" :disabled="filters.page >= pages" aria-label="Next page" @click="go(1)"><ChevronRight class="h-4 w-4" /></button></div></div>
  </div>
</template>
