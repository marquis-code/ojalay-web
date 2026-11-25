<script setup lang="ts">
import { ArrowRight, CalendarDays, Check, ChevronLeft, Clock3, Copy, Landmark, Loader2, MessageCircle, ShieldCheck } from 'lucide-vue-next';
import type { PublicProvider, Service, StorefrontBusiness, StorefrontTemplate } from '~/types';
import { formatNaira } from '~/utils/money';
import { rememberPayment } from '~/utils/pending-payment';
import { publicApi } from '~/api/factories/publicApi';
const props = defineProps<{ business: StorefrontBusiness; template: StorefrontTemplate; service: Service; providers: PublicProvider[]; marketplaceCampus?: string }>();
const { availability, loading, submitting, waitlistLoading, waitlistJoined, error, confirmed, loadAvailability, joinWaitlist, book } = usePublicBookingFlow(props.business.slug);

const step = ref(1);
const promoPercent = ref(0);
const providerId = ref('');
const date = ref('');
const startAt = ref('');
const addOnNames = ref<string[]>([]);
const quantity = ref(Math.max(1, props.service.minQuantity || 1));
const customerName = ref('');
const customerPhone = ref('');
const customerEmail = ref('');
const notes = ref('');
const location = ref('');
const roomNumber = ref('');
const locationError = ref('');
const waitlistName = ref('');
const waitlistPhone = ref('');
const waitlistEmail = ref('');
const waitlistLocation = ref('');
const waitlistRoomNumber = ref('');
const cardPaymentAvailable = computed(() => props.business.cardPaymentEnabled !== false);
const directTransferAvailable = computed(() => Boolean(props.business.directTransfer?.enabled));
const paymentMethod = ref<'paystack' | 'direct_transfer'>(
  directTransferAvailable.value && !cardPaymentAvailable.value ? 'direct_transfer' : directTransferAvailable.value ? 'direct_transfer' : 'paystack'
);
const showPaymentMethodTabs = computed(() => {
  return cardPaymentAvailable.value && directTransferAvailable.value && (deposit.value > 0 || total.value > 0) && !packageCode.value;
});

watch([cardPaymentAvailable, directTransferAvailable], ([cardOk, directOk]) => {
  if (!cardOk && directOk) {
    paymentMethod.value = 'direct_transfer';
  } else if (cardOk && !directOk) {
    paymentMethod.value = 'paystack';
  }
}, { immediate: true });

const transferSenderName = ref('');
const accountCopied = ref(false);

function copyAccountNumber() {
  if (!props.business.directTransfer?.accountNumber) return;
  navigator.clipboard?.writeText(props.business.directTransfer.accountNumber);
  accountCopied.value = true;
  setTimeout(() => { accountCopied.value = false; }, 2000);
}
const packageCode = ref('');
const providerOptions = computed(() => [{ value: '', label: 'Any available team member' }, ...props.providers.map((p) => ({ value: p.id, label: p.name }))]);
const addOns = computed(() => props.service.addOns.filter((a) => addOnNames.value.includes(a.name)));
const displayDuration = computed(() => props.service.showDuration !== false && props.service.durationMinutes > 0);
const quantityEnabled = computed(() => Boolean(props.service.quantityEnabled));
const quantityLabel = computed(() => props.service.quantityLabel || 'Quantity');
const canJoinWaitlist = computed(() => Boolean(availability.value && (availability.value.waitlistAllowed ?? !availability.value.closed)));
const effectiveDuration = computed(() => (props.service.durationMinutes > 0 ? props.service.durationMinutes : (props.business.bookingSettings?.slotIntervalMinutes || 30)) * quantity.value);
const subtotal = computed(() => props.service.priceKobo * quantity.value + addOns.value.reduce((sum, a) => sum + a.priceKobo, 0));
const serviceCharge = computed(() => {
  if (!props.business.serviceChargeEnabled) return 0;
  if (props.business.serviceChargeType === 'fixed') return Math.max(0, props.business.serviceChargeFixedKobo || 0);
  return Math.round((subtotal.value * Math.max(0, props.business.serviceChargePercent || 0)) / 100);
});
const waitlistBaseKobo = computed(() => {
  const qty = quantity.value;
  return props.service.requiresDeposit ? props.service.depositKobo * qty : props.service.priceKobo * qty;
});
const waitlistServiceChargeKobo = computed(() => {
  const b = props.business;
  if (!b?.serviceChargeEnabled || b?.serviceChargeWaitlistEnabled === false) return 0;
  if (b.serviceChargeType === 'fixed') return Math.max(0, b.serviceChargeFixedKobo || 0);
  return Math.round((waitlistBaseKobo.value * Math.max(0, b.serviceChargePercent || 0)) / 100);
});
const waitlistTotalKobo = computed(() => waitlistBaseKobo.value + waitlistServiceChargeKobo.value);
const total = computed(() => subtotal.value + serviceCharge.value);
const collectFull = computed(() => props.business.bookingSettings?.paymentCollection === 'full');
const deposit = computed(() => {
  if (packageCode.value.trim()) return 0;
  if (collectFull.value) return total.value;
  if (!props.service.requiresDeposit) {
    const pct = props.business.bookingSettings?.depositPercent || 0;
    if (pct > 0) return Math.round(subtotal.value * (pct / 100)) + serviceCharge.value;
    return total.value;
  }
  const base = props.service.depositKobo || Math.round(subtotal.value * ((props.business.bookingSettings?.depositPercent || 0) / 100));
  return base > 0 ? base + serviceCharge.value : total.value;
});
const eligibleProviders = computed(() => props.providers.filter((p) => !props.service.providerIds.length || props.service.providerIds.includes(p.id)));
const nextDays = computed(() => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i);
  return { iso: d.toISOString().slice(0, 10), weekday: d.toLocaleDateString('en-NG', { weekday: 'short' }), day: d.getDate() };
}));
function chooseDate(value: string) { date.value = value; startAt.value = ''; void refreshSlots(); }
watch(providerId, () => { if (step.value !== 1) return; startAt.value = ''; void refreshSlots(); });
watch(addOnNames, () => { if (step.value !== 1) return; startAt.value = ''; void refreshSlots(); });
async function refreshSlots() {
  if (!date.value) return;
  await loadAvailability(props.service.id, date.value, providerId.value || undefined, effectiveDuration.value + addOns.value.reduce((sum, a) => sum + (a.durationMinutes || 0), 0));
}
function toggleAddon(name: string) {
  addOnNames.value = addOnNames.value.includes(name) ? addOnNames.value.filter((n) => n !== name) : [...addOnNames.value, name];
}
function changeQuantity(delta: number) {
  const min = Math.max(1, props.service.minQuantity || 1);
  const max = Math.max(min, props.service.maxQuantity || 20);
  quantity.value = Math.min(max, Math.max(min, quantity.value + delta));
  startAt.value = '';
  void refreshSlots();
}
function pick(start: string, providers: { id: string }[]) {
  startAt.value = start;
  if (!providerId.value && providers[0]) providerId.value = providers[0].id;
  step.value = 3;
}
function time(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }); }
async function submit() {
  if (!startAt.value) return;
  if (customerName.value.trim().length < 2) return;
  if (customerPhone.value.trim().length < 7) return;
  const isDirect = Boolean(directTransferAvailable.value && (paymentMethod.value === 'direct_transfer' || !cardPaymentAvailable.value));
  if (isDirect) {
    if (transferSenderName.value.trim().length < 2) {
      error.value = 'Enter your bank account sender name so the business can confirm your payment.';
      return;
    }
  } else if (!packageCode.value.trim() && total.value > 0 && (!customerEmail.value.trim() || !customerEmail.value.includes('@'))) {
    error.value = 'Add your email to pay online and secure your booking.';
    return;
  }
  if (props.business.bookingSettings?.locations?.length && !location.value) { locationError.value = 'Choose where you are booking from.'; return; }
  locationError.value = '';
  try {
    const result = await book({
      serviceId: props.service.id, providerId: providerId.value || undefined, startAt: startAt.value,
      customerName: customerName.value.trim(), customerPhone: customerPhone.value.trim(),
      customerEmail: customerEmail.value.trim() || undefined, notes: notes.value || undefined,
      location: location.value || undefined, roomNumber: roomNumber.value.trim() || undefined,
      packageCode: packageCode.value.trim() || undefined, marketplaceCampus: props.marketplaceCampus || undefined,
      addOnNames: addOnNames.value, quantity: quantity.value,
      paymentMethod: isDirect ? 'direct_transfer' : 'paystack',
      transferSenderName: isDirect ? transferSenderName.value.trim() : undefined,
    });
    if (result.payment?.authorizationUrl) {
      rememberPayment(result.payment.reference, window.location.pathname);
      window.location.href = result.payment.authorizationUrl;
    }
    else if (isDirect || packageCode.value.trim() || total.value === 0) {
      step.value = 4;
    }
  } catch { /* error shown */ }
}
function reset() { step.value = 1; startAt.value = ''; confirmed.value = null; }
async function submitWaitlist() {
  if (waitlistName.value.trim().length < 2 || waitlistPhone.value.trim().length < 7) return;
  if (props.business.bookingSettings?.waitlistPaymentEnabled && !waitlistEmail.value.trim()) { error.value = 'Add your email to pay and join the waitlist.'; return; }
  const from = new Date(`${date.value}T12:00:00`); const to = new Date(from); to.setDate(to.getDate() + 7);
  try {
    const result = await joinWaitlist({
      serviceId: props.service.id, providerId: providerId.value || undefined,
      customerName: waitlistName.value.trim(), customerPhone: waitlistPhone.value.trim(),
      customerEmail: waitlistEmail.value || undefined,
      preferredFrom: date.value, preferredTo: to.toISOString().slice(0, 10), quantity: quantity.value,
      location: waitlistLocation.value || undefined,
      roomNumber: waitlistRoomNumber.value.trim() || undefined,
      notes: 'Joined from the online booking page',
    });
    if (result?.payment?.authorizationUrl) {
      rememberPayment(result.payment.reference, window.location.pathname);
      window.location.href = result.payment.authorizationUrl;
    }
  } catch { /* error shown */ }
}
onMounted(() => { const d = new Date(); date.value = d.toISOString().slice(0, 10); void refreshSlots(); publicApi.newCustomerPromotion().then((promo) => { promoPercent.value = promo.enabled ? promo.percentOff : 0; }).catch(() => undefined); });
</script>

<template>
  <div class="overflow-hidden rounded-[1.8rem] border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 14%, transparent)`, background: template.colors.surface }">
    <div v-if="step === 4 && confirmed?.booking" class="p-6 text-center sm:p-8">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 14%, transparent)`, color: template.colors.primary }"><Check class="h-7 w-7" /></div>
      <h3 class="mt-4 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">You’re booked.</h3>
      <p class="mt-2 text-sm" :style="{ color: template.colors.muted }">{{ confirmed.booking.bookingNumber }} · {{ confirmed.booking.serviceName }}</p>
      <p class="mt-1 text-sm font-semibold" :style="{ color: template.colors.ink }">{{ new Date(confirmed.booking.startAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }) }} at {{ time(confirmed.booking.startAt) }}</p>
      <p v-if="confirmed.booking.location" class="mt-1 text-xs" :style="{ color: template.colors.muted }">{{ confirmed.booking.location }}</p>
      <div v-if="confirmed.booking.paymentStatus === 'pending_verification'" class="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <p class="font-bold flex items-center justify-center gap-1.5"><Landmark class="h-4 w-4" /> Transfer Pending Verification</p>
        <p class="mt-1 text-[11px] leading-relaxed">Your booking has been received! Once {{ business.name }} verifies your bank transfer, you will receive an automatic WhatsApp confirmation.</p>
      </div>
      <div class="mt-5 flex flex-col gap-2">
        <NuxtLink :to="`/booking/${confirmed.booking.publicToken}`" class="inline-flex min-h-[48px] items-center justify-center rounded-full px-5 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">View booking</NuxtLink>
        <a v-if="confirmed.whatsappUrl" :href="confirmed.whatsappUrl" target="_blank" rel="noopener" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border text-sm font-bold" :style="{ borderColor: template.colors.ink, color: template.colors.ink }"><MessageCircle class="h-4 w-4" /> Message the business</a>
      </div>
      <button type="button" class="mt-4 text-xs font-semibold underline" :style="{ color: template.colors.muted }" @click="reset">Book another service</button>
    </div>
    <template v-else>
      <div class="flex items-center justify-between border-b px-4 py-3 sm:px-5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
        <div><p class="text-[9px] font-bold uppercase tracking-[0.16em]" :style="{ color: template.colors.primary }">Book this service</p><p class="mt-0.5 font-display text-lg font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(subtotal) }}<span v-if="displayDuration"> · {{ effectiveDuration }} min</span><span v-if="quantityEnabled"> · {{ quantity }} {{ quantityLabel.toLowerCase() }}</span></p></div>
        <div class="flex gap-1"><span v-for="n in 3" :key="n" class="h-1.5 w-6 rounded-full" :class="step >= n ? '' : 'opacity-20'" :style="{ background: template.colors.primary }" /></div>
      </div>
      <div class="p-4 sm:p-5">
        <div v-if="step === 1" class="space-y-4">
          <div><p class="label-base">Add-ons <span class="font-normal normal-case text-muted">(optional)</span></p><div v-if="service.addOns.length" class="flex flex-wrap gap-2"><button v-for="addon in service.addOns" :key="addon.name" type="button" class="rounded-full border px-3 py-2 text-[10px] font-semibold" :class="addOnNames.includes(addon.name) ? 'border-current' : 'opacity-70'" :style="{ borderColor: template.colors.ink, color: addOnNames.includes(addon.name) ? template.colors.primary : template.colors.muted }" @click="toggleAddon(addon.name)">{{ addon.name }} +{{ formatNaira(addon.priceKobo) }}</button></div><p v-else class="text-xs" :style="{ color: template.colors.muted }">No add-ons for this service.</p></div>
          <div v-if="quantityEnabled" class="rounded-xl border p-3" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)` }">
            <div class="flex items-center justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: template.colors.muted }">{{ quantityLabel }}</p><p class="mt-1 text-[10px]" :style="{ color: template.colors.muted }">{{ formatNaira(service.priceKobo) }} each</p></div><div class="flex items-center gap-2"><button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold" :style="{ borderColor: template.colors.ink }" :disabled="quantity <= (service.minQuantity || 1)" @click="changeQuantity(-1)">−</button><span class="w-6 text-center text-sm font-bold" :style="{ color: template.colors.ink }">{{ quantity }}</span><button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold" :style="{ borderColor: template.colors.ink }" :disabled="quantity >= (service.maxQuantity || 20)" @click="changeQuantity(1)">+</button></div></div>
          </div>
          <BaseSelect v-model="providerId" :options="providerOptions" label="Team member" />
          <div><p class="label-base">Pick a day</p><div class="grid grid-cols-4 gap-1.5 sm:grid-cols-7"><button v-for="d in nextDays" :key="d.iso" type="button" class="rounded-xl border py-2 text-center" :class="date === d.iso ? 'border-current' : ''" :style="{ borderColor: date === d.iso ? template.colors.primary : `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: date === d.iso ? template.colors.primary : template.colors.ink }" @click="chooseDate(d.iso)"><span class="block text-[9px] font-bold uppercase opacity-60">{{ d.weekday }}</span><span class="block text-sm font-bold">{{ d.day }}</span></button></div></div>
          <div>
            <div class="flex items-center justify-between"><p class="label-base">Available times</p><span v-if="loading" class="inline-flex items-center gap-1 text-[10px] text-muted"><Loader2 class="h-3 w-3 animate-spin" /> Checking…</span></div>
            <div v-if="availability?.slots.length" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4"><button v-for="slot in availability.slots" :key="slot.startAt" type="button" class="rounded-xl border py-2.5 text-xs font-bold" :class="startAt === slot.startAt ? 'border-current' : ''" :style="{ borderColor: startAt === slot.startAt ? template.colors.primary : `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: startAt === slot.startAt ? template.colors.primary : template.colors.ink }" @click="pick(slot.startAt, slot.providers)">{{ slot.time }}</button></div>
            <div v-else-if="!loading" class="mt-2 rounded-xl border border-dashed p-4" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }">
              <p v-if="business.bookingSettings?.waitlistPaymentEnabled" class="mb-2 text-[10px] font-semibold" :style="{ color: template.colors.primary }">Payment required to join: {{ formatNaira(waitlistTotalKobo) }}<span v-if="waitlistServiceChargeKobo > 0" class="font-normal opacity-90"> (includes {{ formatNaira(waitlistServiceChargeKobo) }} service charge)</span>. If no suitable slot opens, the business can refund it to your Ojaly wallet.</p><p class="text-xs" :style="{ color: template.colors.muted }">{{ availability?.closed ? (canJoinWaitlist ? 'This business is closed on that day, but you can join the waitlist for a future opening.' : 'This business is closed on that day. Try another day.') : 'Fully booked on this day. Join the waitlist and we’ll message you if a spot opens.' }}</p>
              <div v-if="canJoinWaitlist && waitlistJoined" class="mt-3 rounded-lg bg-success/10 p-3 text-xs font-semibold text-success">You’re on the waitlist. We’ll message you if a slot opens.</div>
              <div v-else-if="canJoinWaitlist" class="mt-3 space-y-2">
                <div class="grid gap-2 sm:grid-cols-2"><BaseInput v-model="waitlistName" label="Your name" placeholder="First and last name" /><BaseInput v-model="waitlistPhone" label="WhatsApp number" type="tel" placeholder="0803 123 4567" /></div>
                <div class="grid gap-2 sm:grid-cols-2">
                  <BaseSelect
                    v-if="business.bookingSettings?.locations?.length"
                    v-model="waitlistLocation"
                    label="Hostel / Location"
                    :options="[{ value: '', label: 'Select location' }, ...(business.bookingSettings.locations || []).map((place) => ({ value: place, label: place }))]"
                  />
                  <BaseInput
                    v-model="waitlistRoomNumber"
                    label="Room number"
                    placeholder="e.g. Room 204 or Block A"
                    :class="!business.bookingSettings?.locations?.length ? 'sm:col-span-2' : ''"
                  />
                </div>
                <BaseInput v-model="waitlistEmail" :label="business.bookingSettings?.waitlistPaymentEnabled ? 'Email (required for payment)' : 'Email (optional)'" type="email" placeholder="For a waitlist alert" :required="business.bookingSettings?.waitlistPaymentEnabled" />
                <BaseButton size="sm" :loading="waitlistLoading" @click="submitWaitlist">Join waitlist</BaseButton>
              </div>
            </div>
          </div>
          <div v-if="error" class="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ error }}</div>
        </div>
        <form v-else-if="step === 3" class="space-y-3" @submit.prevent="submit">
          <div v-if="promoPercent" class="rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-semibold text-brand-700">New customer? Your first booking gets {{ promoPercent }}% off automatically.</div>
          <button type="button" class="inline-flex items-center gap-1 text-[11px] font-bold" :style="{ color: template.colors.muted }" @click="step = 1"><ChevronLeft class="h-3.5 w-3.5" /> Change time</button>
          <div class="rounded-xl p-3 text-xs" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 10%, transparent)`, color: template.colors.ink }"><p class="font-bold">{{ service.name }}</p><p class="mt-0.5">{{ new Date(startAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) }} · {{ time(startAt) }}</p><p v-if="quantityEnabled" class="mt-1 text-[10px] font-semibold">{{ quantity }} {{ quantityLabel.toLowerCase() }} × {{ formatNaira(service.priceKobo) }}</p></div>
          <div v-if="business.bookingSettings?.locations?.length" class="grid gap-2 sm:grid-cols-2">
            <div>
              <BaseSelect v-model="location" label="Where are you booking?" :options="[{ value: '', label: 'Choose a location' }, ...(business.bookingSettings.locations || []).map((place) => ({ value: place, label: place }))]" required />
              <p v-if="locationError" class="mt-1 text-[10px] font-semibold text-danger">{{ locationError }}</p>
            </div>
            <div>
              <BaseInput v-model="roomNumber" label="Room number" placeholder="e.g. Room 204 or Block A" />
            </div>
          </div>
          <div v-else>
            <BaseInput v-model="roomNumber" label="Room / Unit number (optional)" placeholder="e.g. Room 204 or Flat 3" />
          </div>
          <BaseInput v-model="customerName" label="Your name" placeholder="First and last name" required />
          <BaseInput v-model="customerPhone" label="WhatsApp number" type="tel" placeholder="0803 123 4567" required />
          <BaseInput v-model="customerEmail" label="Email" type="email" placeholder="Required for online payment receipt & confirmation" :required="!packageCode && total > 0" />
          <BaseTextarea v-model="notes" label="Anything we should know?" placeholder="Allergies, preferences, parking…" />
          <BaseInput v-model="packageCode" label="Package code (optional)" placeholder="Enter your prepaid code" />
          <div class="space-y-1.5 border-t pt-3 text-xs" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }"><div class="flex items-center justify-between" :style="{ color: template.colors.muted }"><span>Subtotal</span><span>{{ formatNaira(subtotal) }}</span></div><div v-if="serviceCharge" class="flex items-center justify-between" :style="{ color: template.colors.muted }"><span>Service charge</span><span>{{ formatNaira(serviceCharge) }}</span></div><div class="flex items-center justify-between pt-1 text-sm font-semibold" :style="{ color: template.colors.ink }"><span>Total</span><span class="font-display text-xl font-bold">{{ formatNaira(total) }}</span></div></div>
          <div v-if="deposit" class="flex items-center justify-between rounded-xl bg-warning/10 p-3 text-xs text-warning"><span class="inline-flex items-center gap-1"><ShieldCheck class="h-4 w-4" /> {{ deposit >= total ? 'Payment required to secure booking' : 'Commitment fee to secure' }}</span><span class="font-bold">{{ formatNaira(deposit) }}</span></div>

          <!-- Direct Transfer / Payment Method Selector -->
          <div v-if="(directTransferAvailable || cardPaymentAvailable) && (deposit || total > 0) && !packageCode" class="space-y-3 pt-2">
            <!-- Tabs only appear if BOTH card and direct transfer are active -->
            <div v-if="showPaymentMethodTabs" class="space-y-1.5">
              <p class="label-base">Payment Method</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition"
                  :class="paymentMethod === 'direct_transfer' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold dark:bg-brand-950/40 dark:text-brand-300' : 'border-line bg-surface text-muted hover:bg-raised'"
                  @click="paymentMethod = 'direct_transfer'"
                >
                  <span class="flex items-center gap-1.5"><Landmark class="h-3.5 w-3.5 text-brand-600" /> Direct Transfer</span>
                  <span class="text-[10px] opacity-80">Pay to vendor bank</span>
                </button>
                <button
                  type="button"
                  class="flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition"
                  :class="paymentMethod === 'paystack' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold dark:bg-brand-950/40 dark:text-brand-300' : 'border-line bg-surface text-muted hover:bg-raised'"
                  @click="paymentMethod = 'paystack'"
                >
                  <span class="flex items-center gap-1.5"><ShieldCheck class="h-3.5 w-3.5 text-brand-600" /> Pay Online</span>
                  <span class="text-[10px] opacity-80">Cards & Instant</span>
                </button>
              </div>
            </div>

            <!-- Bank Account Card: shows whenever Direct Transfer is the chosen method OR when card payment is disabled -->
            <div
              v-if="directTransferAvailable && (paymentMethod === 'direct_transfer' || !cardPaymentAvailable)"
              class="rounded-2xl border-2 border-brand-500/30 bg-raised/40 p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-ink">Vendor Bank Account</span>
                <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Direct transfer</span>
              </div>
              <div class="space-y-2 rounded-xl border border-line bg-surface p-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-muted">Bank Name</span>
                  <span class="font-bold text-ink">{{ business.directTransfer?.bankName }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Account Number</span>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-sm font-bold tracking-wider text-ink">{{ business.directTransfer?.accountNumber }}</span>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-md bg-raised px-2 py-0.5 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 active:scale-95 transition"
                      @click="copyAccountNumber"
                    >
                      <Check v-if="accountCopied" class="h-3 w-3 text-emerald-600" />
                      <Copy v-else class="h-3 w-3" />
                      <span>{{ accountCopied ? 'Copied' : 'Copy' }}</span>
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Account Name</span>
                  <span class="font-bold text-ink">{{ business.directTransfer?.accountName }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-line pt-2">
                  <span class="font-semibold text-muted">Amount to send</span>
                  <span class="font-display text-base font-bold text-brand-600">{{ formatNaira(deposit || total) }}</span>
                </div>
              </div>
              <p v-if="business.directTransfer?.instructions" class="text-[11px] text-muted">
                {{ business.directTransfer?.instructions }}
              </p>
              <BaseInput
                v-model="transferSenderName"
                label="Sender Account Name (Name on your transfer)"
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>

          <p v-if="error" class="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ error }}</p>
          <BaseButton type="submit" block size="lg" :loading="submitting">
            <template v-if="directTransferAvailable && (paymentMethod === 'direct_transfer' || !cardPaymentAvailable)">
              I have sent {{ formatNaira(deposit || total) }} <ArrowRight class="h-4 w-4" />
            </template>
            <template v-else>
              {{ deposit ? `Pay ${formatNaira(deposit)} ${deposit >= total ? 'now' : 'deposit'}` : 'Confirm booking' }} <ArrowRight class="h-4 w-4" />
            </template>
          </BaseButton>
          <p class="text-center text-[10px]" :style="{ color: template.colors.muted }">You’ll get a confirmation and can change the appointment from your booking page.</p>
        </form>
      </div>
    </template>
  </div>
</template>
