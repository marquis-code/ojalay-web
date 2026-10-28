<script setup lang="ts">
import { ArrowLeft, CalendarDays, Save } from 'lucide-vue-next';
import { useBusinessStore } from '~/stores/business';
import type { BookingSettings } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Booking settings' });

const toast = useToast();
const businessStore = useBusinessStore();
const saving = ref(false);
const business = computed(() => businessStore.business);
const mode = ref<'products' | 'services' | 'hybrid'>('products');
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const form = reactive<BookingSettings>({
  enabled: false, autoConfirm: true, leadTimeMinutes: 120, windowDays: 60, slotIntervalMinutes: 30,
  cancellationWindowHours: 24, depositPercent: 0, reminderHoursBefore: 24,
  weeklyHours: Array.from({ length: 7 }, (_, day) => ({ day, isOpen: day !== 0, start: '09:00', end: '18:00' })),
  closedDates: [], policy: 'Please arrive 5 minutes early. Cancellations within 24 hours may lose the deposit.',
});
const closedDatesInput = ref('');
watchEffect(() => {
  if (!business.value) return;
  mode.value = business.value.businessMode || 'products';
  if (business.value.bookingSettings) {
    Object.assign(form, business.value.bookingSettings);
    form.weeklyHours = business.value.bookingSettings.weeklyHours?.length ? business.value.bookingSettings.weeklyHours : form.weeklyHours;
    closedDatesInput.value = (business.value.bookingSettings.closedDates || []).join(', ');
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
      },
    } as never);
    toast.success('Booking settings saved.');
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
onMounted(async () => { if (!businessStore.context) await businessStore.load(); });
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <NuxtLink to="/app/bookings" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to appointments</NuxtLink>
    <PageHeader title="Booking settings" subtitle="Turn your business into a bookable service business without losing the product side." eyebrow="Bookings">
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
        <BaseInput v-model="form.cancellationWindowHours" label="Cancellation window (hours)" type="number" min="0" />
        <BaseInput v-model="form.depositPercent" label="Deposit %" type="number" min="0" max="100" hint="Used when a service does not set a fixed deposit." />
        <BaseInput v-model="form.reminderHoursBefore" label="Reminder (hours before)" type="number" min="0" />
      </div>
      <label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.autoConfirm" type="checkbox" class="h-4 w-4"> Automatically confirm bookings without a deposit</label>
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
    </div>

    <div class="card space-y-3 p-5">
      <BaseTextarea v-model="form.policy" label="Booking policy shown to customers" placeholder="Arrive 5 minutes early. Deposits are non-refundable within 24 hours." />
      <div class="flex justify-end"><BaseButton :loading="saving" @click="save"><Save class="h-4 w-4" /> Save booking settings</BaseButton></div>
    </div>
  </div>
</template>
