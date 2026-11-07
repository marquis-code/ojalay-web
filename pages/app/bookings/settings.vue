<script setup lang="ts">
import { ArrowLeft, CalendarDays, Copy, Save } from 'lucide-vue-next';
import { useBusinessStore } from '~/stores/business';
import type { BookingSettings } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Booking settings' });

const toast = useToast();
const businessStore = useBusinessStore();
const { calendarFeed } = useBookings();
const feedUrl = ref('');
const saving = ref(false);
const business = computed(() => businessStore.business);
const mode = ref<'products' | 'services' | 'hybrid'>('products');
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const form = reactive<BookingSettings>({
  enabled: false, autoConfirm: true, leadTimeMinutes: 120, windowDays: 60, slotIntervalMinutes: 30,
  cancellationWindowHours: 24, lateCancellationPenaltyType: 'none', lateCancellationPenaltyPercent: 0, lateCancellationPenaltyKobo: 0, depositPercent: 0, paymentCollection: 'deposit', reminderHoursBefore: 24,
  weeklyHours: Array.from({ length: 7 }, (_, day) => ({ day, isOpen: day !== 0, start: '09:00', end: '18:00' })),
  closedDates: [], locations: [], policy: 'Please arrive 5 minutes early. Cancellations within 24 hours may lose the deposit.',
});
const closedDatesInput = ref('');
const locationsInput = ref('');
watchEffect(() => {
  if (!business.value) return;
  mode.value = business.value.businessMode || 'products';
  if (business.value.bookingSettings) {
    Object.assign(form, business.value.bookingSettings);
    form.weeklyHours = business.value.bookingSettings.weeklyHours?.length ? business.value.bookingSettings.weeklyHours : form.weeklyHours;
    closedDatesInput.value = (business.value.bookingSettings.closedDates || []).join(', ');
    locationsInput.value = (business.value.bookingSettings.locations || []).join(', ');
  }
});
async function save() {
  saving.value = true;
  try {
    await businessStore.update({
      businessMode: mode.value,
      bookingSettings: {
        ...form,
        weeklyHours: form.weeklyHours,
        closedDates: closedDatesInput.value.split(',').map((d) => d.trim()).filter(Boolean),
        locations: locationsInput.value.split(',').map((d) => d.trim()).filter(Boolean),
      },
    } as never);
    toast.success('Booking settings saved.');
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function copyFeed() {
  if (!feedUrl.value) return;
  try { await navigator.clipboard.writeText(feedUrl.value); toast.success('Calendar feed copied.'); }
  catch { toast.error('Could not copy. Select the link manually.'); }
}
onMounted(async () => {
  if (!businessStore.context) await businessStore.load();
  try { feedUrl.value = (await calendarFeed()).url; } catch { /* optional */ }
});
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <NuxtLink to="/app/bookings" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to appointments</NuxtLink>
    <PageHeader title="Availability & booking settings" subtitle="When customers can book, where they can book, and how payment is collected." eyebrow="Bookings">
      <template #actions><BaseButton :loading="saving" @click="save"><Save class="h-4 w-4" /> Save settings</BaseButton></template>
    </PageHeader>

    <div class="card p-5">
      <h2 class="font-display text-lg font-bold">How does this business sell?</h2>
      <p class="mt-1 text-xs text-muted">You can switch later. Hybrid businesses can sell products and take appointments.</p>
      <div class="mt-4 grid gap-2 sm:grid-cols-3">
        <button v-for="option in [{ value: 'products', title: 'Products', body: 'Physical goods, stock and delivery.' }, { value: 'services', title: 'Services', body: 'Appointments, team schedules and deposits.' }, { value: 'hybrid', title: 'Both', body: 'A product catalogue plus bookable services.' }]" :key="option.value" type="button" class="rounded-2xl border p-4 text-left" :class="mode === option.value ? 'border-brand-500 bg-brand-50/60' : 'border-line'" @click="mode = option.value as 'products' | 'services' | 'hybrid'">
          <p class="text-sm font-bold">{{ option.title }}</p><p class="mt-1 text-[11px] leading-relaxed text-muted">{{ option.body }}</p>
        </button>
      </div>
    </div>

    <div class="card space-y-4 p-5">
      <div class="flex items-start justify-between gap-3"><div><h2 class="font-display text-lg font-bold">Online booking</h2><p class="text-xs text-muted">Let customers book from your storefront.</p></div><label class="flex items-center gap-2 text-sm font-bold"><input v-model="form.enabled" type="checkbox" class="h-4 w-4"> Enabled</label></div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BaseInput v-model="form.leadTimeMinutes" label="Minimum notice (minutes)" type="number" min="0" hint="120 = at least 2 hours ahead." />
        <BaseInput v-model="form.windowDays" label="Book up to (days ahead)" type="number" min="1" />
        <BaseInput v-model="form.slotIntervalMinutes" label="Slot interval (minutes)" type="number" min="5" />
        <div class="sm:col-span-2 lg:col-span-3 rounded-2xl border border-line bg-raised/30 p-4"><p class="text-sm font-bold">Cancellation policy</p><p class="mt-1 text-[11px] leading-relaxed text-muted">Customers can cancel free until the cutoff. After the cutoff, the late-cancellation penalty applies.</p><div class="mt-3 grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.cancellationWindowHours" label="Free cancellation until (hours before)" type="number" min="0" hint="Example: 24 means free until 24 hours before the appointment." /><BaseSelect v-model="form.lateCancellationPenaltyType" label="Late cancellation penalty" :options="[{ value: 'none', label: 'Do not allow late cancellation online' }, { value: 'percent', label: 'Percentage of service price' }, { value: 'fixed', label: 'Fixed amount' }]" /><BaseInput v-if="form.lateCancellationPenaltyType === 'percent'" v-model="form.lateCancellationPenaltyPercent" label="Penalty percentage" type="number" min="0" max="100" /><BaseInput v-else-if="form.lateCancellationPenaltyType === 'fixed'" :model-value="form.lateCancellationPenaltyKobo / 100" label="Penalty amount (₦)" type="number" min="0" @update:model-value="form.lateCancellationPenaltyKobo = Math.round(Number($event || 0) * 100)" /></div></div>
        <BaseInput v-model="form.depositPercent" label="Deposit %" type="number" min="0" max="100" hint="Used when a service does not set a fixed deposit." />
        <BaseInput v-model="form.reminderHoursBefore" label="Reminder (hours before)" type="number" min="0" />
      </div>
      <label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.autoConfirm" type="checkbox" class="h-4 w-4"> Automatically confirm bookings without a deposit</label>
      <div class="border-t border-line pt-4">
        <p class="text-sm font-bold">What should customers pay when they book?</p>
        <p class="mt-1 text-xs text-muted">This controls the checkout flow for every service booked with this business.</p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" class="rounded-2xl border p-4 text-left" :class="form.paymentCollection === 'deposit' ? 'border-brand-500 bg-brand-50/60' : 'border-line'" @click="form.paymentCollection = 'deposit'">
            <p class="text-sm font-bold">Commitment fee at booking</p><p class="mt-1 text-[11px] leading-relaxed text-muted">Collect the service deposit or deposit percentage now, and the balance after the appointment.</p>
          </button>
          <button type="button" class="rounded-2xl border p-4 text-left" :class="form.paymentCollection === 'full' ? 'border-brand-500 bg-brand-50/60' : 'border-line'" @click="form.paymentCollection = 'full'">
            <p class="text-sm font-bold">Full booking amount</p><p class="mt-1 text-[11px] leading-relaxed text-muted">Collect the complete service subtotal plus the customer service charge at checkout.</p>
          </button>
        </div>
      </div>
    </div>

    <div class="card p-5">
      <div class="flex items-center gap-2"><CalendarDays class="h-4 w-4 text-brand-600" /><h2 class="font-display text-lg font-bold">Business hours</h2></div>
      <p class="mt-1 text-xs text-muted">Team members can override these hours on their own schedules.</p>
      <div class="mt-4 space-y-2">
        <div v-for="d in form.weeklyHours" :key="d.day" class="grid grid-cols-[90px_28px_1fr_1fr] items-center gap-2 rounded-xl border border-line p-2">
          <span class="text-xs font-bold">{{ days[d.day] }}</span>
          <input v-model="d.isOpen" type="checkbox" class="h-4 w-4" :aria-label="`${days[d.day]} open`">
          <input v-model="d.start" type="time" class="input-base !py-2 !text-xs" :disabled="!d.isOpen" :aria-label="`${days[d.day]} opening time`">
          <input v-model="d.end" type="time" class="input-base !py-2 !text-xs" :disabled="!d.isOpen" :aria-label="`${days[d.day]} closing time`">
        </div>
      </div>
      <div class="mt-4"><BaseInput v-model="closedDatesInput" label="Closed dates" placeholder="2026-12-25, 2026-12-26" hint="Comma-separated YYYY-MM-DD dates." /></div>
      <div class="mt-4"><BaseInput v-model="locationsInput" label="Booking locations" placeholder="Block Boys Hostel, Block Girls Hostel, OPH Girls Hostel" hint="Optional. Customers will choose one of these when booking. Comma-separated." /></div>
    </div>

    <div class="card space-y-3 p-5">
      <div class="flex items-start gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><CalendarDays class="h-5 w-5" /></div><div><h2 class="font-display text-lg font-bold">Calendar subscription</h2><p class="text-xs leading-relaxed text-muted">Subscribe once in Google Calendar, Apple Calendar or Outlook and new appointments appear automatically. This is a read-only feed for now.</p></div></div>
      <div class="flex gap-2"><input :value="feedUrl" readonly class="input-base min-w-0 flex-1 !text-[11px]" aria-label="Calendar subscription URL"><BaseButton variant="outline" :disabled="!feedUrl" @click="copyFeed"><Copy class="h-4 w-4" /> Copy</BaseButton></div>
    </div>

    <div class="card space-y-3 p-5">
      <BaseTextarea v-model="form.policy" label="Booking policy shown to customers" placeholder="Arrive 5 minutes early. Deposits are non-refundable within 24 hours." />
      <div class="flex justify-end"><BaseButton :loading="saving" @click="save"><Save class="h-4 w-4" /> Save booking settings</BaseButton></div>
    </div>
  </div>
</template>
