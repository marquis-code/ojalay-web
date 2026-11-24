<script setup lang="ts">
import { ArrowLeft, ArrowRight, CalendarDays, CalendarRange, Check, Clock3, Copy, ExternalLink, MessageCircle, MoreHorizontal, Plus, Repeat2, Settings2, UserRound, Users, UserX, X } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { whatsappLink } from '~/utils/phone';
import type { Booking } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Appointments' });

const toast = useToast();
const route = useRoute();
const { items, loading, summary, filters, slots, slotsLoading, load, loadSlots, setStatus, cancel, refund, roster, reschedule } = useBookings();
const { items: providers, load: loadProviders } = useProviders();
const selected = ref<Booking | null>(null);
const detailOpen = ref(false);
const moreOpen = ref(false);
const busy = ref(false);
const refundOpen = ref(false);
const cancelConfirmOpen = ref(false);
const noShowConfirmOpen = ref(false);
const rosterOpen = ref(false);
const rosterData = ref<import('~/types').BookingRoster | null>(null);
const rosterLoading = ref(false);
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
function openBooking(booking: Booking) { selected.value = booking; detailOpen.value = true; moreOpen.value = false; }
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
async function openRoster(booking: Booking) {
  rosterOpen.value = true; rosterLoading.value = true; rosterData.value = null;
  try { rosterData.value = await roster(booking.id); }
  catch (error) { toast.error((error as Error).message); rosterOpen.value = false; }
  finally { rosterLoading.value = false; }
}
async function confirmRefund() {
  if (!selected.value) return;
  busy.value = true;
  try {
    const result = await refund(selected.value.id);
    toast.success(`${formatNaira(result.amountKobo)} refunded via Paystack.`);
    refundOpen.value = false; selected.value = null; detailOpen.value = false;
  } catch (error) { toast.error((error as Error).message); }
  finally { busy.value = false; }
}
async function cancelBooking(id: string) {
  busy.value = true;
  try { await cancel(id, 'Cancelled by business'); toast.success('Appointment cancelled.'); selected.value = null; detailOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = false; }
}
function waCustomer(booking: Booking) {
  const when = new Date(booking.startAt).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  return whatsappLink(booking.customerPhone, `Hi ${booking.customerName.split(' ')[0]}! This is a reminder about your ${booking.serviceName} with ${booking.providerName} on ${when}. Reference: ${booking.bookingNumber}.`);
}
const copiedToken = ref<string | null>(null);
async function copyBookingLink(token: string) {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ojaly.org';
    await navigator.clipboard.writeText(`${origin}/booking/${token}`);
    copiedToken.value = token;
    toast.success('Client link copied');
    setTimeout(() => {
      if (copiedToken.value === token) copiedToken.value = null;
    }, 2000);
  } catch {
    toast.error('Could not copy link');
  }
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
      <template #actions><NuxtLink to="/app/bookings/waitlist" class="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:bg-raised sm:inline-flex"><Users class="h-4 w-4" /> Waitlist</NuxtLink><NuxtLink to="/app/bookings/settings" class="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:bg-raised sm:inline-flex"><Settings2 class="h-4 w-4" /> Booking settings</NuxtLink><NuxtLink to="/app/bookings/all" class="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:bg-raised sm:inline-flex"><CalendarRange class="h-4 w-4" /> All bookings</NuxtLink><BaseButton to="/app/bookings/new"><Plus class="h-4 w-4" /> New booking</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3" data-tour="booking-stats">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Today</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.today }}</p><p class="text-[11px] text-muted">appointments</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Upcoming</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.upcoming }}</p><p class="text-[11px] text-muted">confirmed or pending</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Needs confirmation</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ summary.pending }}</p><p class="text-[11px] text-muted">waiting on you</p></div>
    </div>

    <div class="card p-3 sm:p-4" data-tour="booking-calendar">
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
          <div class="flex flex-wrap items-center gap-2"><p class="truncate font-bold">{{ booking.customerName }}</p><span class="rounded-full px-2 py-0.5 text-[9px] font-bold capitalize" :class="statusStyles[booking.status]">{{ booking.status.replace('_', ' ') }}</span><span v-if="booking.packageName" class="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700">Package</span><span v-if="booking.seriesTotal > 1" class="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700"><Repeat2 class="h-2.5 w-2.5" /> {{ booking.seriesIndex + 1 }}/{{ booking.seriesTotal }}</span></div>
          <p class="mt-0.5 truncate text-[12px] text-muted">{{ booking.serviceName }} · {{ booking.providerName }}</p><p v-if="booking.quantity && booking.quantity > 1" class="mt-0.5 text-[10px] font-semibold text-brand-600">{{ booking.quantity }} {{ (booking.quantityLabel || 'units').toLowerCase() }}</p>
          <p v-if="booking.addOns.length" class="mt-0.5 truncate text-[10px] text-muted">+ {{ booking.addOns.map((a) => a.name).join(', ') }}</p>
        </div>
        <div class="hidden text-right sm:block"><p class="text-sm font-bold">{{ formatNaira(booking.priceKobo) }}</p><p class="text-[10px]" :class="booking.paymentStatus === 'paid' ? 'text-success' : booking.paymentStatus === 'deposit_paid' ? 'text-warning' : 'text-muted'">{{ booking.paymentStatus.replace('_', ' ') }}</p></div>
      </button>
    </div>

    <BaseModal v-model:open="detailOpen" :title="selected?.customerName || 'Appointment'" :description="selected ? `${selected.bookingNumber} · ${selected.serviceName}` : ''" size="md">
      <div v-if="selected" class="space-y-4">
        <!-- Status & Metadata pill banner -->
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-raised/60 px-3.5 py-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize" :class="statusStyles[selected.status]">
              {{ selected.status.replace('_', ' ') }}
            </span>
            <span v-if="selected.packageName" class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
              {{ selected.packageName }} · {{ selected.packageCode }}
            </span>
            <span v-if="selected.seriesTotal > 1" class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
              <Repeat2 class="h-3 w-3" /> Session {{ selected.seriesIndex + 1 }}/{{ selected.seriesTotal }}
            </span>
          </div>
          <span class="font-mono text-xs font-semibold text-muted">{{ selected.bookingNumber }}</span>
        </div>

        <!-- Balanced Info Cards + 1 Full-width Payment Card -->
        <div class="grid grid-cols-2 gap-2.5 text-xs sm:gap-3">
          <div class="rounded-2xl bg-raised/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">When</p>
            <p class="mt-1 font-bold text-ink">{{ new Date(selected.startAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) }} · {{ time(selected.startAt) }}</p>
          </div>
          <div class="rounded-2xl bg-raised/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Team Member</p>
            <p class="mt-1 truncate font-bold text-ink">{{ selected.providerName }}</p>
          </div>
          <div class="rounded-2xl bg-raised/50 p-3" :class="!selected.location && (!selected.quantity || selected.quantity <= 1) ? 'col-span-2' : ''">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Client Phone</p>
            <p class="mt-1 truncate font-bold text-ink">{{ selected.customerPhone }}</p>
          </div>
          <div v-if="selected.location" class="rounded-2xl bg-raised/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Location</p>
            <p class="mt-1 truncate font-bold text-ink">{{ selected.location }}</p>
          </div>
          <div v-if="selected.quantity && selected.quantity > 1" class="rounded-2xl bg-brand-50/70 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">Quantity</p>
            <p class="mt-1 font-bold text-ink">{{ selected.quantity }} {{ (selected.quantityLabel || 'units').toLowerCase() }}</p>
          </div>

          <!-- Payment Card: full width, clean balance & status -->
          <div class="col-span-2 flex items-center justify-between rounded-2xl bg-raised/50 p-3.5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Payment status</p>
              <div class="mt-0.5 flex items-baseline gap-1.5">
                <span class="font-display text-base font-bold text-ink sm:text-lg">{{ formatNaira(selected.amountPaidKobo) }}</span>
                <span class="text-xs text-muted">of {{ formatNaira(selected.priceKobo) }}</span>
              </div>
            </div>
            <span class="rounded-full px-2.5 py-1 text-[10px] font-bold capitalize sm:px-3 sm:text-[11px]" :class="selected.paymentStatus === 'paid' ? 'bg-success/10 text-success' : selected.paymentStatus === 'deposit_paid' ? 'bg-warning/10 text-warning' : 'bg-muted/15 text-muted'">
              {{ selected.paymentStatus.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <p v-if="selected.notes" class="rounded-2xl border border-line p-3 text-xs text-muted"><strong class="font-semibold text-ink">Notes:</strong> {{ selected.notes }}</p>
        <div v-if="selected.paymentStatus === 'unpaid' && selected.depositKobo" class="rounded-2xl bg-warning/10 p-3 text-xs text-warning">{{ selected.depositKobo >= selected.priceKobo ? 'Full payment' : 'Commitment fee' }} of {{ formatNaira(selected.depositKobo) }} is still unpaid.</div>

        <div v-if="selected.providerFeeKobo" class="rounded-2xl border border-line p-3 text-xs">
          <div class="flex items-center justify-between"><span class="text-muted">Service subtotal</span><span class="font-semibold">{{ formatNaira(selected.priceKobo - (selected.serviceChargeKobo || 0)) }}</span></div>
          <div class="mt-1 flex items-center justify-between"><span class="text-muted">Ojaly provider fee</span><span class="font-semibold text-danger">−{{ formatNaira(selected.providerFeeKobo) }}</span></div>
          <div class="mt-2 flex items-center justify-between border-t border-line pt-2 font-bold"><span>Your payout</span><span>{{ formatNaira(selected.providerNetKobo || 0) }}</span></div>
        </div>

        <!-- Structured Action Buttons -->
        <div class="space-y-3 border-t border-line pt-4">
          <!-- 1. Primary Lifecycle Action -->
          <div v-if="selected.status === 'confirmed'">
            <BaseButton block size="lg" :loading="busy" class="shadow-sm" @click="update(selected.id, 'completed')">
              <Check class="h-4 w-4" /> Complete & record sale
            </BaseButton>
          </div>
          <div v-else-if="selected.status === 'pending'">
            <BaseButton block size="lg" :loading="busy" class="shadow-sm" @click="update(selected.id, 'confirmed')">
              <Check class="h-4 w-4" /> Confirm appointment
            </BaseButton>
          </div>
          <div v-else-if="selected.status === 'completed'" class="flex items-center justify-center gap-1.5 rounded-xl bg-success/10 py-2.5 text-xs font-bold text-success">
            <Check class="h-4 w-4" /> Appointment completed & recorded as sale
          </div>
          <div v-else-if="selected.status === 'cancelled'" class="flex items-center justify-center gap-1.5 rounded-xl bg-danger/10 py-2.5 text-xs font-bold text-danger">
            <X class="h-4 w-4" /> Cancelled{{ selected.cancellationReason ? `: ${selected.cancellationReason}` : '' }}
          </div>
          <div v-else-if="selected.status === 'no_show'" class="flex items-center justify-center gap-1.5 rounded-xl bg-raised py-2.5 text-xs font-bold text-muted">
            Marked as No-show
          </div>

          <!-- 2. Operational & Exception Actions Grid -->
          <div class="grid grid-cols-2 gap-2">
            <!-- WhatsApp -->
            <a
              :href="waCustomer(selected)"
              target="_blank"
              rel="noopener"
              class="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-bold transition hover:border-[#25D366] hover:bg-raised active:scale-[0.98]"
              :class="['cancelled', 'completed'].includes(selected.status) ? 'col-span-2' : ''"
            >
              <MessageCircle class="h-4 w-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            <!-- Reschedule -->
            <BaseButton
              v-if="!['cancelled', 'completed'].includes(selected.status)"
              size="md"
              variant="outline"
              class="min-h-[42px]"
              :loading="busy"
              @click="openReschedule(selected)"
            >
              <CalendarDays class="h-4 w-4 text-brand-600" />
              <span>Reschedule</span>
            </BaseButton>

            <!-- Mark as no-show (Left column, aligned with WhatsApp) -->
            <button
              v-if="selected.status === 'confirmed'"
              type="button"
              class="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-muted transition hover:border-ink hover:text-ink active:scale-[0.98]"
              :disabled="busy"
              @click="noShowConfirmOpen = true"
            >
              <UserX class="h-4 w-4 text-muted" />
              <span>Mark as no-show</span>
            </button>

            <!-- Cancel booking (Right column, aligned with Reschedule) -->
            <button
              v-if="!['cancelled', 'completed'].includes(selected.status)"
              type="button"
              class="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3 text-xs font-bold text-danger transition hover:border-danger hover:bg-danger hover:text-white active:scale-[0.98]"
              :class="selected.status !== 'confirmed' ? 'col-span-2' : ''"
              :disabled="busy"
              @click="cancelConfirmOpen = true"
            >
              <X class="h-4 w-4" />
              <span>Cancel booking</span>
            </button>

            <!-- Refund payment (full width, clean warning tone, only when eligible) -->
            <button
              v-if="selected.amountPaidKobo > (selected.refundedKobo || 0) && selected.status !== 'completed'"
              type="button"
              class="col-span-2 flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-warning/30 bg-warning/5 px-3 text-xs font-bold text-warning transition hover:bg-warning/10 active:scale-[0.98]"
              :disabled="busy"
              @click="refundOpen = true"
            >
              <span>Refund payment ({{ formatNaira(selected.amountPaidKobo - (selected.refundedKobo || 0)) }})</span>
            </button>

            <!-- Group roster (full width, when capacity > 1) -->
            <BaseButton
              v-if="selected.capacity > 1"
              size="md"
              variant="outline"
              class="col-span-2 min-h-[42px]"
              @click="openRoster(selected)"
            >
              <Users class="h-4 w-4 text-brand-600" />
              <span>Group roster ({{ selected.capacity }} spots)</span>
            </BaseButton>
          </div>
        </div>

        <!-- 4. Client Link Footer Bar -->
        <div class="rounded-xl border border-line bg-raised/30 p-2.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-medium text-muted">Client management link</span>
            <button type="button" class="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700" @click="copyBookingLink(selected.publicToken)">
              <Check v-if="copiedToken === selected.publicToken" class="h-3 w-3 text-success" />
              <Copy v-else class="h-3 w-3" />
              <span>{{ copiedToken === selected.publicToken ? 'Copied' : 'Copy link' }}</span>
            </button>
          </div>
          <NuxtLink :to="`/booking/${selected.publicToken}`" target="_blank" class="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-brand-600 hover:underline">
            <span class="truncate">/booking/{{ selected.publicToken }}</span>
            <ExternalLink class="h-3 w-3 shrink-0 opacity-70" />
          </NuxtLink>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model:open="rosterOpen" title="Group roster" description="Everyone booked into this session." size="md">
      <div v-if="rosterLoading" class="skeleton h-32 rounded-2xl" />
      <div v-else-if="rosterData" class="space-y-3">
        <div class="flex items-center justify-between rounded-2xl bg-raised/60 p-3 text-xs font-semibold"><span>{{ rosterData.booked }} of {{ rosterData.capacity }} spots booked</span><span>{{ new Date(rosterData.startAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) }}</span></div>
        <div class="divide-y divide-line"><div v-for="item in rosterData.items" :key="item.id" class="flex items-center justify-between py-3"><div><p class="text-sm font-bold">{{ item.customerName }}</p><p class="text-[10px] text-muted">{{ item.bookingNumber }} · {{ item.customerPhone }}</p></div><div class="text-right"><BaseBadge :variant="item.status === 'confirmed' ? 'success' : 'warning'">{{ item.status }}</BaseBadge><p class="mt-1 text-[10px] text-muted">{{ item.paymentStatus.replace('_', ' ') }}</p></div></div></div>
      </div>
    </BaseModal>

    <ConfirmDialog v-model:open="refundOpen" danger title="Refund this payment?" message="This sends the refundable balance back through Paystack. It cannot be undone." confirm-label="Refund via Paystack" :loading="busy" @confirm="confirmRefund" />
    <ConfirmDialog v-model:open="cancelConfirmOpen" danger title="Cancel this appointment?" message="This appointment will be marked as cancelled. Any booked slot will be released back to your calendar." confirm-label="Yes, cancel booking" :loading="busy" @confirm="selected && cancelBooking(selected.id)" />
    <ConfirmDialog v-model:open="noShowConfirmOpen" title="Mark client as no-show?" message="This client will be recorded as a no-show for this appointment and the slot will be freed." confirm-label="Mark as no-show" :loading="busy" @confirm="selected && (noShowConfirmOpen = false, update(selected.id, 'no_show'))" />

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
