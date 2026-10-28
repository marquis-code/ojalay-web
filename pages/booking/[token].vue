<script setup lang="ts">
definePageMeta({ layout: false });
import { ref, computed } from 'vue';
import { CalendarDays, CalendarPlus, MapPin, MessageCircle, ShieldCheck, X } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error: bookingError, refresh } = await usePublicBooking(token);
if (bookingError.value || !data.value?.booking) {
  throw createError({ statusCode: 404, statusMessage: 'Booking not found', fatal: true });
}
const { busy, error: actionError, cancel, reschedule, pay, availability, calendarUrl } = usePublicBookingActions(token);
const showCancel = ref(false);
const showReschedule = ref(false);
const newDate = ref('');
const newStart = ref('');
const slots = ref<{ startAt: string; time: string; providers: { id: string }[] }[]>([]);
const loadingSlots = ref(false);
const notice = ref('');
const booking = computed(() => data.value?.booking);
const business = computed(() => data.value?.business as Record<string, any> | null);
const timezone = computed(() => booking.value?.timezone || 'Africa/Lagos');
function when(value?: string) { return value ? new Date(value).toLocaleString('en-NG', { timeZone: timezone.value, weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }) : ''; }
async function loadSlots() {
  if (!booking.value || !newDate.value || !business.value?.slug) return;
  loadingSlots.value = true;
  try {
    const result = await availability(String(business.value.slug), booking.value.serviceId, newDate.value);
    slots.value = result.slots;
  } finally { loadingSlots.value = false; }
}
async function doCancel() { try { await cancel('Changed my plans'); notice.value = 'Your appointment has been cancelled.'; showCancel.value = false; await refresh(); } catch { /* error */ } }
async function doReschedule() {
  if (!newStart.value) return;
  try { await reschedule(newStart.value); notice.value = 'Your appointment has been moved.'; showReschedule.value = false; await refresh(); } catch { /* error */ }
}
async function doPay() {
  try { const result = await pay(booking.value?.customerEmail || undefined); window.location.href = result.authorizationUrl; } catch { /* error */ }
}
onMounted(() => { const d = new Date(); d.setDate(d.getDate() + 1); newDate.value = d.toISOString().slice(0, 10); });
watch(showReschedule, (open) => { if (open) void loadSlots(); });
</script>

<template>
  <div class="min-h-dvh bg-canvas px-4 py-8 text-ink">
    <div class="mx-auto max-w-xl">
      <NuxtLink to="/" class="inline-flex items-center gap-2"><LogoMark /></NuxtLink>
      <div v-if="booking" class="mt-8 overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift">
        <div class="border-b border-line p-6" :style="{ background: `color-mix(in srgb, ${business?.brandColor || '#FF5A1F'} 12%, transparent)` }">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">Your appointment</p>
          <h1 class="mt-2 font-display text-3xl font-bold tracking-tight">{{ booking.serviceName }}</h1>
          <p class="mt-1 text-sm text-muted">{{ booking.bookingNumber }}</p>
        </div>
        <div class="space-y-4 p-6">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">When</p><p class="mt-1 text-sm font-bold">{{ when(booking.startAt) }}</p></div>
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">With</p><p class="mt-1 text-sm font-bold">{{ booking.providerName }}</p></div>
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total</p><p class="mt-1 text-sm font-bold">{{ formatNaira(booking.priceKobo) }}</p></div>
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Status</p><p class="mt-1 text-sm font-bold capitalize">{{ booking.status.replace('_', ' ') }} · {{ booking.paymentStatus.replace('_', ' ') }}</p></div>
          </div>
          <p v-if="business?.address" class="flex items-start gap-2 text-xs text-muted"><MapPin class="mt-0.5 h-4 w-4 shrink-0" /> {{ business.address }}</p>
          <p v-if="business?.bookingSettings?.policy" class="rounded-2xl border border-line p-4 text-xs leading-relaxed text-muted">{{ business.bookingSettings.policy }}</p>
          <div v-if="notice" class="rounded-2xl bg-success/10 p-3 text-xs font-semibold text-success">{{ notice }}</div>
          <div v-if="actionError" class="rounded-2xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ actionError }}</div>
          <div v-if="booking.paymentStatus !== 'paid' && booking.status !== 'cancelled'" class="rounded-2xl bg-warning/10 p-4">
            <p class="flex items-center gap-2 text-xs font-bold text-warning"><ShieldCheck class="h-4 w-4" /> {{ booking.amountPaidKobo ? 'Balance due' : booking.depositKobo ? 'Deposit due' : 'Payment due' }}</p>
            <p class="mt-1 text-xs text-muted">{{ formatNaira(booking.amountPaidKobo) }} paid of {{ formatNaira(booking.priceKobo) }}</p>
            <BaseButton class="mt-3" size="sm" :loading="busy" @click="doPay">Pay securely</BaseButton>
          </div>
          <div v-if="booking.status === 'completed' && booking.reviewToken && !booking.reviewedAt" class="rounded-2xl bg-brand-50 p-4"><p class="text-xs font-bold text-brand-700">How did it go?</p><p class="mt-1 text-xs text-brand-700/80">Leave a quick review for {{ business?.name }}.</p><BaseButton :to="`/review/${booking.reviewToken}`" size="sm" class="mt-3">Leave a review</BaseButton></div>
          <div class="flex flex-wrap gap-2 border-t border-line pt-4">
            <BaseButton v-if="booking.status !== 'cancelled' && booking.status !== 'completed'" size="sm" variant="outline" @click="showReschedule = true"><CalendarDays class="h-4 w-4" /> Reschedule</BaseButton>
            <a :href="calendarUrl()" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-bold"><CalendarPlus class="h-4 w-4" /> Add to calendar</a>
            <a v-if="business?.whatsappNumber || business?.publicPhone" :href="`https://wa.me/${String(business?.whatsappNumber || business?.publicPhone).replace(/\\D/g, '')}`" target="_blank" rel="noopener" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-bold"><MessageCircle class="h-4 w-4" /> Message business</a>
            <button v-if="booking.status !== 'cancelled' && booking.status !== 'completed'" type="button" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-danger hover:bg-danger/5" @click="showCancel = true"><X class="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      </div>
      <BaseModal v-model:open="showCancel" title="Cancel this appointment?" description="This cannot be undone. If you are inside the cancellation window, please message the business." size="sm">
        <div class="flex gap-2"><BaseButton variant="ghost" block @click="showCancel = false">Keep it</BaseButton><BaseButton variant="danger" block :loading="busy" @click="doCancel">Cancel appointment</BaseButton></div>
      </BaseModal>
      <BaseModal v-model:open="showReschedule" title="Move your appointment" description="Choose a new date and time. The business is notified." size="md">
        <div class="space-y-4">
          <BaseDatePicker v-model="newDate" label="New date" :min="new Date().toISOString().slice(0,10)" @update:model-value="loadSlots" />
          <div v-if="loadingSlots" class="grid grid-cols-4 gap-2"><div v-for="i in 8" :key="i" class="skeleton h-10 rounded-xl" /></div>
          <div v-else-if="slots.length" class="grid grid-cols-4 gap-2"><button v-for="slot in slots" :key="slot.startAt" type="button" class="rounded-xl border py-2.5 text-xs font-bold" :class="newStart === slot.startAt ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line'" @click="newStart = slot.startAt">{{ slot.time }}</button></div>
          <p v-else class="rounded-xl border border-dashed p-4 text-xs text-muted">Choose a date to see available times.</p>
          <BaseButton block :loading="busy" :disabled="!newStart" @click="doReschedule">Confirm new time</BaseButton>
        </div>
      </BaseModal>
    </div>
  </div>
</template>
