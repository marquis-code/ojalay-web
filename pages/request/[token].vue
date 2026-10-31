<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Clock, MessageCircle, Send, ShieldCheck, Sparkles, XCircle } from 'lucide-vue-next';
import { customRequestsApi } from '~/api/factories/customRequestsApi';
import { formatNaira } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
definePageMeta({ layout: false });
useCustomerTheme();
const route = useRoute();
const router = useRouter();
const token = computed(() => String(route.params.token));
const { data: request, pending, error, refresh } = await useAsyncData(`custom-request-${token.value}`, () => customRequestsApi.byToken(token.value));
useSeoMeta({ title: 'Your custom request', robots: 'noindex' });
const message = ref('');
const sending = ref(false);
const accepting = ref(false);
const actionError = ref('');
const canAccept = computed(() => request.value?.status === 'quoted' && Boolean(request.value.quote));
async function sendMessage() {
  if (!message.value.trim()) return;
  sending.value = true; actionError.value = '';
  try { await customRequestsApi.messagePublic(token.value, message.value.trim()); message.value = ''; await refresh(); }
  catch (err) { actionError.value = (err as Error).message; }
  finally { sending.value = false; }
}
async function acceptQuote() {
  accepting.value = true; actionError.value = '';
  try { const result = await customRequestsApi.accept(token.value); await router.push(`/booking/${result.booking.publicToken}`); }
  catch (err) { actionError.value = (err as Error).message; }
  finally { accepting.value = false; }
}
</script>

<template>
  <div class="min-h-dvh bg-canvas px-4 py-6 sm:px-6">
    <div class="mx-auto max-w-3xl">
      <NuxtLink v-if="request?.business" :to="`/s/${request.business.slug}/services`" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><ArrowLeft class="h-4 w-4" /> Back to {{ request.business.name }}</NuxtLink>
      <div v-if="pending" class="mt-4 space-y-3"><div class="skeleton h-24 rounded-3xl" /><div class="skeleton h-44 rounded-3xl" /></div>
      <div v-else-if="error || !request" class="mt-10 rounded-3xl border border-line bg-surface p-8 text-center"><XCircle class="mx-auto h-10 w-10 text-danger" /><h1 class="mt-3 font-display text-2xl font-bold">Request not found</h1><p class="mt-1 text-sm text-muted">Check the link or ask the business to resend it.</p></div>
      <template v-else>
        <header class="mt-5 rounded-3xl bg-forest-900 p-5 text-white sm:p-6"><div class="flex items-start gap-3"><img v-if="request.business?.logoUrl" :src="request.business.logoUrl" :alt="request.business?.name || ''" class="h-12 w-12 rounded-xl object-cover"><div class="min-w-0 flex-1"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">Custom request · {{ request.serviceName }}</p><h1 class="mt-1 font-display text-2xl font-bold">{{ request.business?.name }}</h1><p class="mt-1 text-xs text-white/60">{{ request.style || request.serviceName }}<span v-if="request.length"> · {{ request.length }}</span></p></div><span class="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider" :class="request.status === 'booked' ? 'text-success' : request.status === 'quoted' ? 'text-brand-300' : 'text-white/60'">{{ request.status.replace('_', ' ') }}</span></div></header>

        <div class="mt-4 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
          <div class="space-y-4">
            <div class="rounded-3xl border border-line bg-surface p-5"><div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Your brief</h2><Sparkles class="h-4 w-4 text-brand-500" /></div><dl class="mt-3 grid grid-cols-2 gap-3 text-xs"><div><dt class="text-[10px] uppercase tracking-wider text-muted">Hair</dt><dd class="mt-0.5 font-semibold capitalize">{{ request.hairOption.replace('_', ' ') }}</dd></div><div><dt class="text-[10px] uppercase tracking-wider text-muted">Preferred</dt><dd class="mt-0.5 font-semibold">{{ request.preferredDate || 'Flexible' }} {{ request.preferredTime }}</dd></div><div><dt class="text-[10px] uppercase tracking-wider text-muted">Budget</dt><dd class="mt-0.5 font-semibold">{{ request.budgetKobo ? formatNaira(request.budgetKobo) : 'Open' }}</dd></div><div><dt class="text-[10px] uppercase tracking-wider text-muted">Reference</dt><dd class="mt-0.5 font-semibold">{{ request.referenceUrls.length }} link{{ request.referenceUrls.length === 1 ? '' : 's' }}</dd></div></dl><p v-if="request.notes" class="mt-3 rounded-xl bg-raised/60 p-3 text-xs leading-relaxed text-muted">{{ request.notes }}</p><div v-if="request.referenceUrls.length" class="mt-3 flex flex-wrap gap-2"><a v-for="(url, i) in request.referenceUrls" :key="url" :href="url" target="_blank" rel="noopener" class="text-[10px] font-bold text-brand-600 underline">Reference {{ i + 1 }}</a></div></div>

            <div v-if="request.quote" class="rounded-3xl border-2 border-forest-900 bg-surface p-5"><div class="flex items-center justify-between"><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Quote from {{ request.business?.name }}</p><h2 class="mt-1 font-display text-2xl font-bold">{{ formatNaira(request.quote.totalKobo) }}</h2></div><ShieldCheck class="h-6 w-6 text-success" /></div><div class="mt-4 divide-y divide-line rounded-2xl bg-raised/50 px-3"><div v-for="item in request.quote.items" :key="item.label" class="flex justify-between py-2.5 text-xs"><span class="text-muted">{{ item.label }}</span><span class="font-bold">{{ formatNaira(item.amountKobo) }}</span></div></div><div class="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p class="text-[10px] uppercase tracking-wider text-muted">Appointment</p><p class="mt-1 font-bold">{{ formatDateTime(request.quote.startAt) }}</p></div><div><p class="text-[10px] uppercase tracking-wider text-muted">Duration</p><p class="mt-1 font-bold">{{ request.quote.durationMinutes }} minutes</p></div><div><p class="text-[10px] uppercase tracking-wider text-muted">Deposit</p><p class="mt-1 font-bold">{{ formatNaira(request.quote.depositKobo) }}</p></div><div><p class="text-[10px] uppercase tracking-wider text-muted">Expires</p><p class="mt-1 font-bold">{{ formatDateTime(request.quote.expiresAt) }}</p></div></div><p v-if="request.quote.note" class="mt-3 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">{{ request.quote.note }}</p><button v-if="canAccept" type="button" class="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white disabled:opacity-50" :disabled="accepting" @click="acceptQuote"><CheckCircle2 class="h-4 w-4" /> {{ accepting ? 'Creating booking…' : `Accept quote · ${formatNaira(request.quote.totalKobo)}` }}</button><NuxtLink v-else-if="request.status === 'booked' && request.bookingPublicToken" :to="`/booking/${request.bookingPublicToken}`" class="mt-4 block rounded-xl bg-success/10 p-3 text-center text-xs font-semibold text-success">Booked. Open your booking to pay the deposit →</NuxtLink><p v-else-if="request.status === 'expired'" class="mt-4 rounded-xl bg-warning/10 p-3 text-center text-xs font-semibold text-warning"><Clock class="mr-1 inline h-3.5 w-3.5" /> This quote expired. Message the business for a new one.</p></div>
            <div v-else class="rounded-3xl border border-dashed border-line bg-surface p-6 text-center"><Clock class="mx-auto h-6 w-6 text-muted" /><p class="mt-2 text-sm font-bold">{{ request.status === 'declined' ? 'This request was declined.' : 'Waiting for a quote.' }}</p><p class="mt-1 text-xs text-muted">The business will reply here with price, hair, duration and deposit.</p></div>

            <div class="rounded-3xl border border-line bg-surface p-5"><h2 class="flex items-center gap-2 font-display text-lg font-bold"><MessageCircle class="h-4 w-4 text-brand-600" /> Conversation</h2><div v-if="request.messages.length" class="mt-3 space-y-2"><div v-for="(msg, i) in request.messages" :key="i" class="max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="msg.sender === 'customer' ? 'ml-auto bg-forest-900 text-white' : 'bg-raised text-ink'"><p>{{ msg.body }}</p><p class="mt-1 text-[9px] opacity-50">{{ msg.sender === 'business' ? request.business?.name : 'You' }}</p></div></div><div class="mt-3 flex gap-2"><input v-model="message" type="text" placeholder="Ask about hair, timing or the style…" class="min-h-[44px] flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @keyup.enter="sendMessage"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending" aria-label="Send message" @click="sendMessage"><Send class="h-4 w-4" /></button></div><p v-if="actionError" class="mt-2 text-[11px] font-semibold text-danger">{{ actionError }}</p><p class="mt-2 text-[10px] text-muted">Keep this conversation here so your quote, payment and booking stay together.</p></div>
          </div>
          <aside class="h-fit rounded-3xl border border-line bg-surface p-5"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Why keep this here?</p><ul class="mt-3 space-y-3 text-[11px] leading-relaxed text-muted"><li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Written quote tied to this request</li><li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Deposit and receipt in one place</li><li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Booking, reschedule and review record</li></ul><p class="mt-4 text-[10px] leading-relaxed text-muted">If you move to WhatsApp, Ojaly cannot protect the quote or payment.</p></aside>
        </div>
      </template>
    </div>
  </div>
</template>
