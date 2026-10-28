<script setup lang="ts">
import { ArrowRight, CalendarDays, Check, ChevronLeft, Clock3, Loader2, MessageCircle, ShieldCheck } from 'lucide-vue-next';
import type { PublicProvider, Service, StorefrontBusiness, StorefrontTemplate } from '~/types';
import { formatNaira } from '~/utils/money';
const props = defineProps<{ business: StorefrontBusiness; template: StorefrontTemplate; service: Service; providers: PublicProvider[] }>();
const { availability, loading, submitting, waitlistLoading, waitlistJoined, error, confirmed, loadAvailability, joinWaitlist, book } = usePublicBookingFlow(props.business.slug);

const step = ref(1);
const providerId = ref('');
const date = ref('');
const startAt = ref('');
const addOnNames = ref<string[]>([]);
const customerName = ref('');
const customerPhone = ref('');
const customerEmail = ref('');
const notes = ref('');
const waitlistName = ref('');
const waitlistPhone = ref('');
const waitlistEmail = ref('');
const packageCode = ref('');
const providerOptions = computed(() => [{ value: '', label: 'Any available team member' }, ...props.providers.map((p) => ({ value: p.id, label: p.name }))]);
const addOns = computed(() => props.service.addOns.filter((a) => addOnNames.value.includes(a.name)));
const total = computed(() => props.service.priceKobo + addOns.value.reduce((sum, a) => sum + a.priceKobo, 0));
const deposit = computed(() => {
  if (!props.service.requiresDeposit) return 0;
  return props.service.depositKobo || Math.round(total.value * ((props.business.bookingSettings?.depositPercent || 0) / 100));
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
  await loadAvailability(props.service.id, date.value, providerId.value || undefined, props.service.durationMinutes + addOns.value.reduce((sum, a) => sum + (a.durationMinutes || 0), 0));
}
function toggleAddon(name: string) {
  addOnNames.value = addOnNames.value.includes(name) ? addOnNames.value.filter((n) => n !== name) : [...addOnNames.value, name];
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
  try {
    const result = await book({
      serviceId: props.service.id, providerId: providerId.value || undefined, startAt: startAt.value,
      customerName: customerName.value.trim(), customerPhone: customerPhone.value.trim(),
      customerEmail: customerEmail.value || undefined, notes: notes.value || undefined, packageCode: packageCode.value || undefined,
      addOnNames: addOnNames.value,
    });
    if (result.payment?.authorizationUrl) window.location.href = result.payment.authorizationUrl;
    else step.value = 4;
  } catch { /* error shown */ }
}
function reset() { step.value = 1; startAt.value = ''; confirmed.value = null; }
async function submitWaitlist() {
  if (waitlistName.value.trim().length < 2 || waitlistPhone.value.trim().length < 7) return;
  const from = new Date(`${date.value}T12:00:00`); const to = new Date(from); to.setDate(to.getDate() + 7);
  try {
    await joinWaitlist({
      serviceId: props.service.id, providerId: providerId.value || undefined,
      customerName: waitlistName.value.trim(), customerPhone: waitlistPhone.value.trim(),
      customerEmail: waitlistEmail.value || undefined,
      preferredFrom: date.value, preferredTo: to.toISOString().slice(0, 10),
      notes: 'Joined from the online booking page',
    });
  } catch { /* error shown */ }
}
onMounted(() => { const d = new Date(); date.value = d.toISOString().slice(0, 10); void refreshSlots(); });
</script>

<template>
  <div class="overflow-hidden rounded-[1.8rem] border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 14%, transparent)`, background: template.colors.surface }">
    <div v-if="step === 4 && confirmed" class="p-6 text-center sm:p-8">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 14%, transparent)`, color: template.colors.primary }"><Check class="h-7 w-7" /></div>
      <h3 class="mt-4 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">You’re booked.</h3>
      <p class="mt-2 text-sm" :style="{ color: template.colors.muted }">{{ confirmed.booking.bookingNumber }} · {{ confirmed.booking.serviceName }}</p>
      <p class="mt-1 text-sm font-semibold" :style="{ color: template.colors.ink }">{{ new Date(confirmed.booking.startAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }) }} at {{ time(confirmed.booking.startAt) }}</p>
      <div class="mt-5 flex flex-col gap-2">
        <NuxtLink :to="`/booking/${confirmed.booking.publicToken}`" class="inline-flex min-h-[48px] items-center justify-center rounded-full px-5 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">View booking</NuxtLink>
        <a v-if="confirmed.whatsappUrl" :href="confirmed.whatsappUrl" target="_blank" rel="noopener" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border text-sm font-bold" :style="{ borderColor: template.colors.ink, color: template.colors.ink }"><MessageCircle class="h-4 w-4" /> Message the business</a>
      </div>
      <button type="button" class="mt-4 text-xs font-semibold underline" :style="{ color: template.colors.muted }" @click="reset">Book another service</button>
    </div>
    <template v-else>
      <div class="flex items-center justify-between border-b px-4 py-3 sm:px-5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }">
        <div><p class="text-[9px] font-bold uppercase tracking-[0.16em]" :style="{ color: template.colors.primary }">Book this service</p><p class="mt-0.5 font-display text-lg font-bold" :style="{ color: template.colors.ink }">{{ formatNaira(service.priceKobo) }} · {{ service.durationMinutes }} min</p></div>
        <div class="flex gap-1"><span v-for="n in 3" :key="n" class="h-1.5 w-6 rounded-full" :class="step >= n ? '' : 'opacity-20'" :style="{ background: template.colors.primary }" /></div>
      </div>
      <div class="p-4 sm:p-5">
        <div v-if="step === 1" class="space-y-4">
          <div><p class="label-base">Add-ons <span class="font-normal normal-case text-muted">(optional)</span></p><div v-if="service.addOns.length" class="flex flex-wrap gap-2"><button v-for="addon in service.addOns" :key="addon.name" type="button" class="rounded-full border px-3 py-2 text-[10px] font-semibold" :class="addOnNames.includes(addon.name) ? 'border-current' : 'opacity-70'" :style="{ borderColor: template.colors.ink, color: addOnNames.includes(addon.name) ? template.colors.primary : template.colors.muted }" @click="toggleAddon(addon.name)">{{ addon.name }} +{{ formatNaira(addon.priceKobo) }}</button></div><p v-else class="text-xs" :style="{ color: template.colors.muted }">No add-ons for this service.</p></div>
          <BaseSelect v-model="providerId" :options="providerOptions" label="Team member" />
          <div><p class="label-base">Pick a day</p><div class="grid grid-cols-4 gap-1.5 sm:grid-cols-7"><button v-for="d in nextDays" :key="d.iso" type="button" class="rounded-xl border py-2 text-center" :class="date === d.iso ? 'border-current' : ''" :style="{ borderColor: date === d.iso ? template.colors.primary : `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: date === d.iso ? template.colors.primary : template.colors.ink }" @click="chooseDate(d.iso)"><span class="block text-[9px] font-bold uppercase opacity-60">{{ d.weekday }}</span><span class="block text-sm font-bold">{{ d.day }}</span></button></div></div>
          <div>
            <div class="flex items-center justify-between"><p class="label-base">Available times</p><span v-if="loading" class="inline-flex items-center gap-1 text-[10px] text-muted"><Loader2 class="h-3 w-3 animate-spin" /> Checking…</span></div>
            <div v-if="availability?.slots.length" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4"><button v-for="slot in availability.slots" :key="slot.startAt" type="button" class="rounded-xl border py-2.5 text-xs font-bold" :class="startAt === slot.startAt ? 'border-current' : ''" :style="{ borderColor: startAt === slot.startAt ? template.colors.primary : `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: startAt === slot.startAt ? template.colors.primary : template.colors.ink }" @click="pick(slot.startAt, slot.providers)">{{ slot.time }}</button></div>
            <div v-else-if="!loading" class="mt-2 rounded-xl border border-dashed p-4" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 20%, transparent)` }">
              <p class="text-xs" :style="{ color: template.colors.muted }">{{ availability?.closed ? 'This business is closed on that day. Try another day.' : 'Fully booked on this day. Join the waitlist and we’ll message you if a spot opens.' }}</p>
              <div v-if="!availability?.closed && waitlistJoined" class="mt-3 rounded-lg bg-success/10 p-3 text-xs font-semibold text-success">You’re on the waitlist. We’ll message you if a slot opens.</div>
              <div v-else-if="!availability?.closed" class="mt-3 space-y-2">
                <div class="grid gap-2 sm:grid-cols-2"><BaseInput v-model="waitlistName" label="Your name" placeholder="First and last name" /><BaseInput v-model="waitlistPhone" label="WhatsApp number" type="tel" placeholder="0803 123 4567" /></div>
                <BaseInput v-model="waitlistEmail" label="Email (optional)" type="email" placeholder="For a waitlist alert" />
                <BaseButton size="sm" :loading="waitlistLoading" @click="submitWaitlist">Join waitlist</BaseButton>
              </div>
            </div>
          </div>
          <div v-if="error" class="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ error }}</div>
        </div>
        <form v-else-if="step === 3" class="space-y-3" @submit.prevent="submit">
          <button type="button" class="inline-flex items-center gap-1 text-[11px] font-bold" :style="{ color: template.colors.muted }" @click="step = 1"><ChevronLeft class="h-3.5 w-3.5" /> Change time</button>
          <div class="rounded-xl p-3 text-xs" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 10%, transparent)`, color: template.colors.ink }"><p class="font-bold">{{ service.name }}</p><p class="mt-0.5">{{ new Date(startAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) }} · {{ time(startAt) }}</p></div>
          <BaseInput v-model="customerName" label="Your name" placeholder="First and last name" required />
          <BaseInput v-model="customerPhone" label="WhatsApp number" type="tel" placeholder="0803 123 4567" required />
          <BaseInput v-model="customerEmail" label="Email" type="email" placeholder="For your confirmation" />
          <BaseTextarea v-model="notes" label="Anything we should know?" placeholder="Allergies, preferences, parking…" />
          <BaseInput v-model="packageCode" label="Package code (optional)" placeholder="Enter your prepaid code" />
          <div class="flex items-center justify-between border-t pt-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)` }"><span>Total</span><span class="font-display text-xl font-bold">{{ formatNaira(total) }}</span></div>
          <div v-if="deposit" class="flex items-center justify-between rounded-xl bg-warning/10 p-3 text-xs text-warning"><span class="inline-flex items-center gap-1"><ShieldCheck class="h-4 w-4" /> Deposit to secure</span><span class="font-bold">{{ formatNaira(deposit) }}</span></div>
          <p v-if="error" class="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ error }}</p>
          <BaseButton type="submit" block size="lg" :loading="submitting">{{ deposit ? `Pay ${formatNaira(deposit)} deposit` : 'Confirm booking' }} <ArrowRight class="h-4 w-4" /></BaseButton>
          <p class="text-center text-[10px]" :style="{ color: template.colors.muted }">You’ll get a confirmation and can change the appointment from your booking page.</p>
        </form>
      </div>
    </template>
  </div>
</template>
