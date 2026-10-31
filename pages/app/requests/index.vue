<script setup lang="ts">
import { ArrowUpRight, Check, Clock, MessageCircle, Send, Sparkles, X } from 'lucide-vue-next';
import { customRequestsApi } from '~/api/factories/customRequestsApi';
import { formatNaira, nairaToKobo } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
import type { CustomRequest } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Custom requests' });
const toast = useToast();
const { items, loading, load } = useCustomRequests();
const selectedId = ref('');
const selected = computed(() => items.value.find((request) => request.id === selectedId.value) || items.value[0] || null);
const quoteOpen = ref(false);
const saving = ref(false);
const message = ref('');
const sending = ref(false);
const form = reactive({ service: '', hair: '', addOn: '', duration: 120, deposit: '', date: '', time: '', note: '', expires: 48 });
const totalKobo = computed(() => nairaToKobo(form.service) + nairaToKobo(form.hair) + nairaToKobo(form.addOn));
function openQuote(request: CustomRequest) {
  selectedId.value = request.id;
  form.service = String(request.budgetKobo / 100 || '');
  form.hair = '';
  form.addOn = '';
  form.duration = 120;
  form.deposit = String(Math.round((request.budgetKobo * 0.2) / 100) || '');
  form.date = request.preferredDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  form.time = request.preferredTime || '10:00';
  form.note = '';
  form.expires = 48;
  quoteOpen.value = true;
}
async function sendQuote() {
  if (!selected.value) return;
  if (totalKobo.value <= 0) return toast.error('Add at least a service price.');
  if (!form.date || !form.time) return toast.error('Choose the appointment date and time.');
  const startAt = new Date(`${form.date}T${form.time}:00`).toISOString();
  saving.value = true;
  try {
    const itemsPayload = [
      { label: selected.value.serviceName || 'Service', amountKobo: nairaToKobo(form.service) },
      ...(nairaToKobo(form.hair) > 0 ? [{ label: 'Hair / hair sourcing', amountKobo: nairaToKobo(form.hair) }] : []),
      ...(nairaToKobo(form.addOn) > 0 ? [{ label: 'Add-on', amountKobo: nairaToKobo(form.addOn) }] : []),
    ].filter((item) => item.amountKobo > 0);
    await customRequestsApi.quote(selected.value.id, {
      items: itemsPayload, durationMinutes: Number(form.duration) || 120,
      depositKobo: Math.min(nairaToKobo(form.deposit), totalKobo.value), startAt,
      note: form.note, expiresInHours: Number(form.expires) || 48,
      serviceKobo: nairaToKobo(form.service), hairKobo: nairaToKobo(form.hair), addOnKobo: nairaToKobo(form.addOn),
    });
    quoteOpen.value = false;
    await load();
    toast.success('Quote sent. The customer has been emailed.');
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function sendMessage() {
  if (!selected.value || !message.value.trim()) return;
  sending.value = true;
  try { await customRequestsApi.message(selected.value.id, message.value.trim()); message.value = ''; await load(); }
  catch (error) { toast.error((error as Error).message); }
  finally { sending.value = false; }
}
async function decline(request: CustomRequest) {
  try { await customRequestsApi.decline(request.id, 'The business declined this request.'); await load(); toast.info('Request declined.'); }
  catch (error) { toast.error((error as Error).message); }
}
const statusTone: Record<string, string> = { new: 'warning', quoted: 'accent', booked: 'success', declined: 'danger', expired: 'neutral' };
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Custom requests" subtitle="Complex styles, quotes and conversations — kept inside Ojaly." eyebrow="Demand">
      <template #actions><BaseButton variant="outline" :loading="loading" @click="load">Refresh</BaseButton></template>
    </PageHeader>

    <div class="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
      <BaseCard class="p-0">
        <div class="flex items-center justify-between border-b border-line p-4"><h2 class="font-display text-lg font-bold">Requests</h2><span class="text-[10px] font-semibold text-muted">{{ items.length }} total</span></div>
        <div v-if="loading" class="space-y-2 p-3"><div v-for="i in 3" :key="i" class="skeleton h-20 rounded-xl" /></div>
        <div v-else-if="items.length" class="divide-y divide-line">
          <button v-for="request in items" :key="request.id" type="button" class="w-full p-4 text-left transition hover:bg-raised/50" :class="selected?.id === request.id ? 'bg-raised/60' : ''" @click="selectedId = request.id">
            <div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="truncate text-xs font-bold">{{ request.customerName }}</p><p class="mt-0.5 truncate text-[10px] text-muted">{{ request.style || request.serviceName }} · {{ request.length || 'length TBC' }}</p></div><BaseBadge :variant="(statusTone[request.status] as any) || 'neutral'">{{ request.status }}</BaseBadge></div>
            <div class="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{{ request.preferredDate || 'Flexible date' }} {{ request.preferredTime }}</span><span>{{ request.quote ? formatNaira(request.quote.totalKobo) : 'Awaiting quote' }}</span></div>
          </button>
        </div>
        <div v-else class="p-8 text-center"><Sparkles class="mx-auto h-7 w-7 text-muted" /><p class="mt-3 text-sm font-bold">No custom requests yet.</p><p class="mt-1 text-xs leading-relaxed text-muted">When a student can’t find an exact style, their request will land here.</p></div>
      </BaseCard>

      <div v-if="selected" class="space-y-4">
        <BaseCard>
          <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Request from {{ selected.customerName }}</p><h2 class="mt-1 font-display text-2xl font-bold">{{ selected.style || selected.serviceName }}</h2><p class="mt-1 text-xs text-muted">{{ selected.length || 'Length not specified' }} · hair: {{ selected.hairOption.replace('_', ' ') }}</p></div><div class="flex gap-2"><BaseButton v-if="selected.status !== 'booked'" size="sm" @click="openQuote(selected)"><Check class="h-3.5 w-3.5" /> {{ selected.quote ? 'Update quote' : 'Send quote' }}</BaseButton><a :href="`/request/${selected.publicToken}`" target="_blank" rel="noopener" class="inline-flex min-h-[36px] items-center rounded-lg border border-line px-3 text-[11px] font-bold">Customer view <ArrowUpRight class="h-3 w-3" /></a></div></div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2"><div class="rounded-xl bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Contact</p><p class="mt-1 text-xs font-semibold">{{ selected.customerPhone }}</p><p class="text-[10px] text-muted">{{ selected.customerEmail || 'No email' }}</p></div><div class="rounded-xl bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Preferred</p><p class="mt-1 text-xs font-semibold">{{ selected.preferredDate || 'Flexible' }} {{ selected.preferredTime }}</p><p class="text-[10px] text-muted">Budget {{ selected.budgetKobo ? formatNaira(selected.budgetKobo) : 'open' }}</p></div></div>
          <p v-if="selected.notes" class="mt-3 rounded-xl border border-line p-3 text-xs leading-relaxed text-muted">{{ selected.notes }}</p>
          <div v-if="selected.referenceUrls.length" class="mt-2 flex flex-wrap gap-2"><a v-for="(url, i) in selected.referenceUrls" :key="url" :href="url" target="_blank" rel="noopener" class="text-[10px] font-bold text-brand-600 underline">Reference {{ i + 1 }}</a></div>
          <div v-if="selected.quote" class="mt-4 rounded-2xl border border-success/20 bg-success/5 p-4"><div class="flex items-center justify-between"><p class="text-[10px] font-bold uppercase tracking-wider text-success">Quote sent</p><p class="font-display text-xl font-bold">{{ formatNaira(selected.quote.totalKobo) }}</p></div><div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted"><span>{{ formatDateTime(selected.quote.startAt) }}</span><span>{{ selected.quote.durationMinutes }} min</span><span>Deposit {{ formatNaira(selected.quote.depositKobo) }}</span><span>Expires {{ formatDateTime(selected.quote.expiresAt) }}</span></div></div>
          <div class="mt-4 flex flex-wrap gap-2"><BaseButton v-if="selected.status === 'new' || selected.status === 'quoted'" size="sm" variant="outline" @click="openQuote(selected)">Build quote</BaseButton><BaseButton v-if="selected.status !== 'booked' && selected.status !== 'declined'" size="sm" variant="ghost" class="!text-danger" @click="decline(selected)"><X class="h-3.5 w-3.5" /> Decline</BaseButton></div>
        </BaseCard>

        <BaseCard>
          <h2 class="flex items-center gap-2 font-display text-lg font-bold"><MessageCircle class="h-4 w-4 text-brand-600" /> Conversation with {{ selected.customerName }}</h2>
          <div v-if="selected.messages.length" class="mt-3 space-y-2"><div v-for="(msg, i) in selected.messages" :key="i" class="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="msg.sender === 'business' ? 'ml-auto bg-forest-900 text-white' : 'bg-raised text-ink'"><p>{{ msg.body }}</p><p class="mt-1 text-[9px] opacity-50">{{ msg.name }}</p></div></div>
          <p v-else class="mt-2 text-xs text-muted">No messages yet. Ask about hair, length or timing here — not on WhatsApp.</p>
          <div class="mt-3 flex gap-2"><input v-model="message" type="text" placeholder="Reply inside Ojaly…" class="min-h-[44px] flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @keyup.enter="sendMessage"><BaseButton size="sm" :loading="sending" @click="sendMessage"><Send class="h-3.5 w-3.5" /> Send</BaseButton></div>
        </BaseCard>
      </div>
      <BaseCard v-else class="flex min-h-[320px] items-center justify-center text-center"><div><Sparkles class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">Select a request</p><p class="mt-1 text-xs text-muted">Review the brief, reply and send a quote.</p></div></BaseCard>
    </div>

    <BaseModal v-model:open="quoteOpen" :title="`Quote for ${selected?.customerName || 'customer'}`" description="Price the service, hair and extras. The customer accepts and pays the deposit inside Ojaly." size="md">
      <form class="space-y-4" @submit.prevent="sendQuote">
        <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.service" label="Service price" prefix="₦" inputmode="decimal" required /><BaseInput v-model="form.hair" label="Hair / sourcing" prefix="₦" inputmode="decimal" /><BaseInput v-model="form.addOn" label="Add-on" prefix="₦" inputmode="decimal" /><BaseInput v-model="form.duration" label="Duration (minutes)" type="number" min="15" required /><BaseInput v-model="form.date" label="Appointment date" type="date" required /><BaseInput v-model="form.time" label="Appointment time" type="time" required /><BaseInput v-model="form.deposit" label="Deposit" prefix="₦" inputmode="decimal" /><BaseInput v-model="form.expires" label="Quote expires (hours)" type="number" min="1" max="168" /></div>
        <BaseTextarea v-model="form.note" label="Note to customer" placeholder="Hair arrives Friday. Bring your own hair for ₦X less." />
        <div class="flex items-center justify-between rounded-xl bg-raised/60 p-3"><span class="text-xs font-semibold text-muted">Quote total</span><span class="font-display text-2xl font-bold">{{ formatNaira(totalKobo) }}</span></div>
        <div class="flex justify-end gap-2"><BaseButton type="button" variant="ghost" @click="quoteOpen = false">Cancel</BaseButton><BaseButton type="submit" :loading="saving"><Check class="h-4 w-4" /> Send quote</BaseButton></div>
      </form>
    </BaseModal>
  </div>
</template>
