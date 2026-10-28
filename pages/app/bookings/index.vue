<script setup lang="ts">
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Plus, Settings2, UserRound, X } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import type { Booking } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Appointments' });

const toast = useToast();
const route = useRoute();
const { items, loading, summary, filters, slots, slotsLoading, load, loadSlots, setStatus, cancel, reschedule } = useBookings();
const { items: providers, load: loadProviders } = useProviders();
const selected = ref<Booking | null>(null);
const detailOpen = ref(false);
const busy = ref(false);
const rescheduleOpen = ref(false);
const newDate = ref('');
const newStart = ref('');
const statusOptions = [
  { value: 'all', label: 'All appointments' }, { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }, { value: 'no_show', label: 'No-show' },
];
const providerOptions = computed(() => [{ value: '', label: 'Everyone' }, ...providers.value.map((p) => ({ value: p.id, label: p.name }))]);
const weekDays = computed(() => {
  const base = new Date(`${filters.date}T12:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base); d.setDate(base.getDate() - 3 + i);
    return { iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-NG', { weekday: 'short' }), num: d.getDate() };
  });
});
const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', confirmed: 'bg-success/10 text-success',
  completed: 'bg-brand-50 text-brand-700', cancelled: 'bg-danger/10 text-danger', no_show: 'bg-raised text-muted',
};
function shiftDay(delta: number) {
  const d = new Date(`${filters.date}T12:00:00`); d.setDate(d.getDate() + delta);
  filters.date = d.toISOString().slice(0, 10); void load();
}
function openBooking(booking: Booking) { selected.value = booking; detailOpen.value = true; }
async function openReschedule(booking: Booking) {
  selected.value = booking;
  const d = new Date(booking.startAt); const today = new Date();
  if (d < today) d.setDate(today.getDate() + 1);
  newDate.value = d.toISOString().slice(0, 10); newStart.value = '';
  rescheduleOpen.value = true;
  await loadSlots(booking.serviceId, newDate.value, booking.providerId);
}
async function loadNewSlots() { if (selected.value && newDate.value) { newStart.value = ''; await loadSlots(selected.value.serviceId, newDate.value, selected.value.providerId); } }
async function confirmReschedule() {
  if (!selected.value || !newStart.value) return;
  busy.value = true;
  try { await reschedule(selected.value.id, newStart.value, selected.value.providerId); toast.success('Appointment moved.'); rescheduleOpen.value = false; detailOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = false; }
}
async function update(id: string, status: string) {
  busy.value = true;
  try { await setStatus(id, status); toast.success(`Booking ${status.replace('_', ' ')}.`); selected.value = items.value.find((b) => b.id === id) || null; }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = false; }
}
async function cancelBooking(id: string) {
  busy.value = true;
  try { await cancel(id, 'Cancelled by business'); toast.success('Appointment cancelled.'); selected.value = null; detailOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = false; }
}
function time(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }); }
function dateLabel(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }); }
watch(() => [filters.status, filters.providerId, filters.date], () => load());
onMounted(async () => {
  if (typeof route.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(route.query.date)) filters.date = route.query.date;
  await Promise.all([load(), loadProviders()]);
});
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Appointments" subtitle="Your day, your team and every client in one calm calendar." eyebrow="Bookings">
      <template #actions><NuxtLink to="/app/bookings/settings" class="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:bg-raised sm:inline-flex"><Settings2 class="h-4 w-4" /> Booking settings</NuxtLink><BaseButton to="/app/bookings/new"><Plus class="h-4 w-4" /> New booking</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Today</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.today }}</p><p class="text-[11px] text-muted">appointments</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Upcoming</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.upcoming }}</p><p class="text-[11px] text-muted">confirmed or pending</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Needs confirmation</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ summary.pending }}</p><p class="text-[11px] text-muted">waiting on you</p></div>
    </div>

    <div class="card p-3 sm:p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="flex items-center gap-1">
          <button class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-raised" aria-label="Previous day" @click="shiftDay(-1)"><ArrowLeft class="h-4 w-4" /></button>
          <BaseDatePicker v-model="filters.date" aria-label="Choose appointment date" class="!w-44" />
          <button class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-raised" aria-label="Next day" @click="shiftDay(1)"><ArrowRight class="h-4 w-4" /></button>
        </div>
        <div class="scrollbar-none flex flex-1 gap-1 overflow-x-auto">
          <button v-for="d in weekDays" :key="d.iso" class="min-w-[58px] rounded-xl px-2 py-2 text-center" :class="filters.date === d.iso ? 'bg-ink text-canvas' : 'hover:bg-raised'" @click="filters.date = d.iso; load()">
            <span class="block text-[9px] font-bold uppercase opacity-60">{{ d.label }}</span><span class="block text-sm font-bold">{{ d.num }}</span>
          </button>
        </div>
        <div class="flex gap-2">
          <BaseSelect v-model="filters.providerId" :options="providerOptions" aria-label="Filter by team member" class="!w-40" />
          <BaseSelect v-model="filters.status" :options="statusOptions" aria-label="Filter by status" class="!w-44" />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div><h2 class="font-display text-2xl font-bold">{{ dateLabel(filters.date) }}</h2><p class="text-xs text-muted">{{ items.length }} appointment{{ items.length === 1 ? '' : 's' }} · {{ providers.find((p) => p.id === filters.providerId)?.name || 'All team members' }}</p></div>
      <NuxtLink to="/app/bookings/new" class="text-xs font-bold text-brand-600 hover:underline">Add appointment →</NuxtLink>
    </div>

    <div v-if="loading" class="space-y-2"><div v-for="i in 4" :key="i" class="skeleton h-24 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No appointments here" message="A clear day. Add a walk-in or share your booking link so customers can fill it." action-label="Add appointment" @action="navigateTo('/app/bookings/new')">
      <template #icon><CalendarDays class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="space-y-2">
      <button v-for="booking in items" :key="booking.id" type="button" class="card flex w-full items-center gap-3 p-3 text-left transition hover:border-ink hover:shadow-soft sm:gap-4 sm:p-4" @click="openBooking(booking)">
        <div class="w-14 shrink-0 text-center sm:w-16"><p class="font-display text-lg font-bold">{{ time(booking.startAt) }}</p><p class="text-[9px] font-semibold text-muted">{{ booking.durationMinutes }} min</p></div>
        <div class="h-12 w-1 shrink-0 rounded-full" :style="{ background: booking.providerColor || '#FF5A1F' }" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2"><p class="truncate font-bold">{{ booking.customerName }}</p><span class="rounded-full px-2 py-0.5 text-[9px] font-bold capitalize" :class="statusStyles[booking.status]">{{ booking.status.replace('_', ' ') }}</span></div>
          <p class="mt-0.5 truncate text-[12px] text-muted">{{ booking.serviceName }} · {{ booking.providerName }}</p>
          <p v-if="booking.addOns.length" class="mt-0.5 truncate text-[10px] text-muted">+ {{ booking.addOns.map((a) => a.name).join(', ') }}</p>
        </div>
        <div class="hidden text-right sm:block"><p class="text-sm font-bold">{{ formatNaira(booking.priceKobo) }}</p><p class="text-[10px]" :class="booking.paymentStatus === 'paid' ? 'text-success' : booking.paymentStatus === 'deposit_paid' ? 'text-warning' : 'text-muted'">{{ booking.paymentStatus.replace('_', ' ') }}</p></div>
      </button>
    </div>

    <BaseModal v-model:open="detailOpen" :title="selected?.customerName || 'Appointment'" :description="selected ? `${selected.bookingNumber} · ${selected.serviceName}` : ''" size="md">
      <div v-if="selected" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-2xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">When</p><p class="mt-1 font-bold">{{ new Date(selected.startAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) }} · {{ time(selected.startAt) }}</p></div>
          <div class="rounded-2xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Team</p><p class="mt-1 font-bold">{{ selected.providerName }}</p></div>
          <div class="rounded-2xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Client</p><p class="mt-1 font-bold">{{ selected.customerPhone }}</p></div>
          <div class="rounded-2xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Payment</p><p class="mt-1 font-bold">{{ formatNaira(selected.amountPaidKobo) }} / {{ formatNaira(selected.priceKobo) }}</p></div>
        </div>
        <p v-if="selected.notes" class="rounded-2xl border border-line p-3 text-xs text-muted">{{ selected.notes }}</p>
        <div v-if="selected.paymentStatus === 'unpaid' && selected.depositKobo" class="rounded-2xl bg-warning/10 p-3 text-xs text-warning">Deposit of {{ formatNaira(selected.depositKobo) }} is still unpaid.</div>
        <div class="flex flex-wrap gap-2">
          <BaseButton v-if="!['cancelled', 'completed'].includes(selected.status)" size="sm" variant="outline" :loading="busy" @click="openReschedule(selected)"><CalendarDays class="h-4 w-4" /> Reschedule</BaseButton>
          <BaseButton v-if="selected.status === 'pending'" size="sm" :loading="busy" @click="update(selected.id, 'confirmed')"><Check class="h-4 w-4" /> Confirm</BaseButton>
          <BaseButton v-if="selected.status === 'confirmed'" size="sm" :loading="busy" @click="update(selected.id, 'completed')"><Check class="h-4 w-4" /> Complete & record sale</BaseButton>
          <BaseButton v-if="selected.status === 'confirmed'" size="sm" variant="outline" :loading="busy" @click="update(selected.id, 'no_show')">No-show</BaseButton>
          <BaseButton v-if="!['cancelled', 'completed'].includes(selected.status)" size="sm" variant="ghost" class="text-danger" :loading="busy" @click="cancelBooking(selected.id)"><X class="h-4 w-4" /> Cancel</BaseButton>
        </div>
        <div class="border-t border-line pt-3 text-xs text-muted"><p>Client can manage this booking here:</p><NuxtLink :to="`/booking/${selected.publicToken}`" target="_blank" class="mt-1 block break-all font-semibold text-brand-600">/booking/{{ selected.publicToken }}</NuxtLink></div>
      </div>
    </BaseModal>

    <BaseModal v-model:open="rescheduleOpen" title="Move appointment" description="This checks live availability before saving." size="md">
      <div class="space-y-4">
        <BaseDatePicker v-model="newDate" label="New date" :min="new Date().toISOString().slice(0,10)" @update:model-value="loadNewSlots" />
        <div v-if="slotsLoading" class="grid grid-cols-4 gap-2"><div v-for="i in 8" :key="i" class="skeleton h-10 rounded-xl" /></div>
        <div v-else-if="slots?.slots.length" class="grid grid-cols-4 gap-2"><button v-for="slot in slots.slots" :key="slot.startAt" type="button" class="rounded-xl border py-2.5 text-xs font-bold" :class="newStart === slot.startAt ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line'" @click="newStart = slot.startAt">{{ slot.time }}</button></div>
        <p v-else class="rounded-xl border border-dashed p-4 text-xs text-muted">No open times for this date. Try another day.</p>
        <div class="flex justify-end gap-2"><BaseButton variant="ghost" @click="rescheduleOpen = false">Cancel</BaseButton><BaseButton :disabled="!newStart" :loading="busy" @click="confirmReschedule">Confirm new time</BaseButton></div>
      </div>
    </BaseModal>
  </div>
</template>
