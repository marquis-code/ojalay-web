<script setup lang="ts">
import { ArrowLeft, CalendarDays, Check, Clock3, Repeat2, UserRound } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'New appointment' });

const toast = useToast();
const router = useRouter();
const { items: services, load: loadServices } = useServices();
const { items: providers, load: loadProviders } = useProviders();
const { slots, slotsLoading, loadSlots, create, createRecurring } = useBookings();
const saving = ref(false);
const form = reactive({
  serviceId: '', providerId: '', date: '', startAt: '',
  customerName: '', customerPhone: '', customerEmail: '', notes: '', addOnNames: [] as string[],
  repeat: 'none', occurrences: '4',
});
const repeatOptions = [
  { value: 'none', label: 'One appointment' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Every month' },
];
const serviceOptions = computed(() => services.value.filter((s) => s.isActive).map((s) => ({ value: s.id, label: `${s.name} · ${formatNaira(s.priceKobo)} · ${s.durationMinutes}m` })));
const providerOptions = computed(() => [{ value: '', label: 'Any available team member' }, ...providers.value.filter((p) => p.isActive && p.isBookable).map((p) => ({ value: p.id, label: p.name }))]);
const selectedService = computed(() => services.value.find((s) => s.id === form.serviceId) || null);
const selectedAddons = computed(() => selectedService.value?.addOns.filter((a) => form.addOnNames.includes(a.name)) || []);
const totalKobo = computed(() => (selectedService.value?.priceKobo || 0) + selectedAddons.value.reduce((sum, a) => sum + a.priceKobo, 0));
const allProviders = computed(() => providers.value.filter((p) => p.isActive && p.isBookable));
const eligibleProviders = computed(() => {
  if (!selectedService.value) return allProviders.value;
  return allProviders.value.filter((p) => !selectedService.value!.providerIds.length || selectedService.value!.providerIds.includes(p.id));
});

function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }
watch(() => [form.serviceId, form.providerId, form.date], async () => {
  form.startAt = '';
  if (form.serviceId && form.date) await loadSlots(form.serviceId, form.date, form.providerId || undefined);
});
function pickSlot(startAt: string, providers: { id: string; name: string }[]) {
  form.startAt = startAt;
  if (!form.providerId && providers[0]) form.providerId = providers[0].id;
}
function toggleAddon(name: string) { form.addOnNames = form.addOnNames.includes(name) ? form.addOnNames.filter((n) => n !== name) : [...form.addOnNames, name]; }
function displayTime(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }); }
async function submit() {
  if (!form.serviceId || !form.startAt) return toast.error('Choose a service and an available time.');
  if (form.customerName.trim().length < 2) return toast.error('Add the customer name.');
  if (form.customerPhone.trim().length < 7) return toast.error('Add a valid customer phone number.');
  saving.value = true;
  try {
    const payload = {
      serviceId: form.serviceId, providerId: form.providerId || undefined, startAt: form.startAt,
      customerName: form.customerName, customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined, notes: form.notes, addOnNames: form.addOnNames,
    };
    if (form.repeat !== 'none') {
      const result = await createRecurring({ ...payload, frequency: form.repeat, occurrences: Number(form.occurrences) || 2 });
      toast.success(`${result.bookings.length} appointments booked as a repeating series.`);
    } else {
      await create(payload);
      toast.success('Appointment booked. The client can now pay a deposit or manage the booking.');
    }
    await router.push('/app/bookings');
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
onMounted(async () => { form.date = tomorrow(); await Promise.all([loadServices(), loadProviders()]); });
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <NuxtLink to="/app/bookings" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to appointments</NuxtLink>
    <PageHeader title="New appointment" subtitle="Book a client in without double-booking the team." eyebrow="Bookings" />

    <form class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" data-tour="booking-form" @submit.prevent="submit">
      <div class="space-y-4">
        <div class="card space-y-4 p-5">
          <h2 class="font-display text-lg font-bold">What are they booking?</h2>
          <BaseSelect v-model="form.serviceId" :options="serviceOptions" label="Service" placeholder="Choose a service" searchable required />
          <BaseSelect v-model="form.providerId" :options="providerOptions" label="Team member" />
          <div v-if="selectedService" class="flex flex-wrap gap-2 text-[10px] font-semibold text-muted"><span class="rounded-full bg-raised px-2.5 py-1.5">{{ selectedService.durationMinutes }} min</span><span class="rounded-full bg-raised px-2.5 py-1.5">{{ formatNaira(selectedService.priceKobo) }}</span><span v-if="selectedService.requiresDeposit" class="rounded-full bg-warning/10 px-2.5 py-1.5 text-warning">Deposit {{ formatNaira(selectedService.depositKobo) }}</span></div>
          <div v-if="selectedService?.addOns.length">
            <p class="label-base">Add-ons</p>
            <div class="flex flex-wrap gap-2"><button v-for="addon in selectedService.addOns" :key="addon.name" type="button" class="rounded-full border px-3 py-2 text-[11px] font-semibold" :class="form.addOnNames.includes(addon.name) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-muted'" @click="toggleAddon(addon.name)">{{ addon.name }} · {{ formatNaira(addon.priceKobo) }}</button></div>
          </div>
        </div>

        <div class="card space-y-4 p-5">
          <h2 class="font-display text-lg font-bold">When?</h2>
          <BaseDatePicker v-model="form.date" label="Date" :min="new Date().toISOString().slice(0,10)" />
          <div class="rounded-2xl border border-line bg-raised/30 p-3">
            <BaseSelect v-model="form.repeat" :options="repeatOptions" label="Repeat" />
            <div v-if="form.repeat !== 'none'" class="mt-2 flex items-end gap-2">
              <BaseInput v-model="form.occurrences" label="Number of appointments" type="number" min="2" max="12" class="max-w-[170px]" />
              <p class="pb-3 text-[10px] leading-relaxed text-muted">Each session is checked against live availability before anything is saved.</p>
            </div>
          </div>
          <div v-if="slotsLoading" class="grid grid-cols-3 gap-2"><div v-for="i in 6" :key="i" class="skeleton h-10 rounded-xl" /></div>
          <div v-else-if="slots?.slots.length" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <button v-for="slot in slots.slots" :key="slot.startAt" type="button" class="rounded-xl border px-2 py-2.5 text-xs font-bold" :class="form.startAt === slot.startAt ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface hover:border-ink'" @click="pickSlot(slot.startAt, slot.providers)">{{ slot.time }}</button>
          </div>
          <p v-else-if="form.serviceId && form.date" class="rounded-xl bg-warning/10 p-3 text-xs font-semibold text-warning">No open times on this date. Try another day or team member.</p>
          <p v-else class="text-xs text-muted">Choose a service and date to see available times.</p>
          <div v-if="slots?.timezone" class="flex items-center gap-1.5 text-[10px] text-muted"><Clock3 class="h-3 w-3" /> Times shown in {{ slots.timezone.replace('_', ' ') }}</div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="card space-y-4 p-5">
          <h2 class="font-display text-lg font-bold">Who is coming?</h2>
          <BaseInput v-model="form.customerName" label="Customer name" placeholder="e.g. Tola Bakare" required />
          <BaseInput v-model="form.customerPhone" label="Phone" type="tel" placeholder="0803 123 4567" required />
          <BaseInput v-model="form.customerEmail" label="Email" type="email" placeholder="For confirmation and deposit link" />
          <BaseTextarea v-model="form.notes" label="Notes" placeholder="Allergies, preferences, anything the team should know" />
        </div>
        <div class="card p-5">
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Summary</p>
          <div class="mt-2 flex items-center justify-between text-sm"><span>{{ selectedService?.name || 'Service' }}</span><span class="font-bold">{{ formatNaira(selectedService?.priceKobo || 0) }}</span></div>
          <div v-for="addon in selectedAddons" :key="addon.name" class="mt-1 flex items-center justify-between text-xs text-muted"><span>+ {{ addon.name }}</span><span>{{ formatNaira(addon.priceKobo) }}</span></div>
          <div class="mt-3 flex items-center justify-between border-t border-line pt-3 font-display text-xl font-bold"><span>Total</span><span>{{ formatNaira(totalKobo) }}</span></div>
          <div v-if="selectedService?.requiresDeposit" class="mt-2 flex items-center justify-between text-xs text-warning"><span>Deposit required</span><span>{{ formatNaira(selectedService.depositKobo) }}</span></div>
          <div v-if="form.repeat !== 'none'" class="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"><span class="inline-flex items-center gap-1"><Repeat2 class="h-3.5 w-3.5" /> Repeating</span><span>{{ form.occurrences }} sessions · {{ repeatOptions.find((o) => o.value === form.repeat)?.label }}</span></div>
          <BaseButton type="submit" block size="lg" class="mt-5" :loading="saving"><CalendarDays class="h-4 w-4" /> {{ form.repeat === 'none' ? 'Book appointment' : `Book ${form.occurrences} appointments` }}</BaseButton>
          <p class="mt-2 text-center text-[10px] text-muted">The client receives a booking page, receipt and reminders.</p>
        </div>
        <div v-if="eligibleProviders.length" class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Available team</p><div class="mt-2 flex flex-wrap gap-2"><span v-for="p in eligibleProviders" :key="p.id" class="inline-flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-1.5 text-[10px] font-semibold"><span class="h-2 w-2 rounded-full" :style="{ background: p.color }" /> {{ p.name }}</span></div></div>
      </div>
    </form>
  </div>
</template>
