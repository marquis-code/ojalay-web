<script setup lang="ts">
import { rememberPayment } from '~/utils/pending-payment';
definePageMeta({ layout: false });
useCustomerTheme();
import { ref, computed } from 'vue';
import { CalendarDays, CalendarPlus, MapPin, MessageCircle, ShieldCheck, X } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { publicBookingMessagesApi } from '~/api/factories/bookingMessagesApi';
import { uploadsApi } from '~/api/factories/uploadsApi';
import type { BookingMessage, BookingMessageThread } from '~/types';
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
const chat = ref<BookingMessageThread | null>(null);
const chatDraft = ref('');
const chatAttachment = ref<{ url: string; optimizedUrl: string } | null>(null);
const chatSending = ref(false);
const chatUploading = ref(false);
const chatError = ref('');
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
  try { const result = await pay(booking.value?.customerEmail || undefined); rememberPayment(result.reference, window.location.pathname); window.location.href = result.authorizationUrl; } catch { /* error */ }
}
async function loadChat() { try { chat.value = await publicBookingMessagesApi.thread(token.value); } catch { /* booking messages are optional */ } }
async function sendChat() {
  if (!chatDraft.value.trim() && !chatAttachment.value) return;
  chatSending.value = true; chatError.value = '';
  try {
    await publicBookingMessagesApi.send(token.value, { body: chatDraft.value.trim() || undefined, attachments: chatAttachment.value ? [chatAttachment.value.url] : undefined });
    chatDraft.value = ''; chatAttachment.value = null; await loadChat();
  } catch (error) { chatError.value = (error as Error).message; }
  finally { chatSending.value = false; }
}
async function addChatAttachment(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file) return;
  chatUploading.value = true; chatError.value = '';
  try { chatAttachment.value = await uploadsApi.uploadPublicRequestImage(file); }
  catch (error) { chatError.value = (error as Error).message; }
  finally { chatUploading.value = false; }
}
onMounted(() => { const d = new Date(); d.setDate(d.getDate() + 1); newDate.value = d.toISOString().slice(0, 10); void loadChat(); });
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
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total</p><p class="mt-1 text-sm font-bold">{{ formatNaira(booking.priceKobo) }}</p><p v-if="booking.discountKobo" class="mt-1 text-[9px] font-semibold text-success">{{ booking.promotionLabel || 'New customer discount' }} · −{{ formatNaira(booking.discountKobo) }}</p><p v-if="booking.serviceChargeKobo" class="mt-1 text-[9px] text-muted">{{ formatNaira(booking.subtotalKobo || 0) }} service + {{ formatNaira(booking.serviceChargeKobo) }} service charge</p></div>
            <div class="rounded-2xl bg-raised/60 p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Status</p><p class="mt-1 text-sm font-bold capitalize">{{ booking.status.replace('_', ' ') }} · {{ booking.paymentStatus.replace('_', ' ') }}</p></div>
          </div>
          <p v-if="booking.location || business?.address" class="flex items-start gap-2 text-xs text-muted"><MapPin class="mt-0.5 h-4 w-4 shrink-0" /> {{ booking.location || business?.address }}</p>
          <p v-if="business?.bookingSettings?.policy" class="rounded-2xl border border-line p-4 text-xs leading-relaxed text-muted">{{ business.bookingSettings.policy }}</p>
          <div v-if="notice" class="rounded-2xl bg-success/10 p-3 text-xs font-semibold text-success">{{ notice }}</div>
          <div v-if="actionError" class="rounded-2xl bg-danger/10 p-3 text-xs font-semibold text-danger">{{ actionError }}</div>
          <div v-if="booking.paymentStatus !== 'paid' && booking.status !== 'cancelled'" class="rounded-2xl bg-warning/10 p-4">
            <p class="flex items-center gap-2 text-xs font-bold text-warning"><ShieldCheck class="h-4 w-4" /> {{ booking.amountPaidKobo ? 'Balance due' : booking.depositKobo && booking.depositKobo < booking.priceKobo ? 'Commitment fee due' : 'Full payment due' }}</p>
            <p class="mt-1 text-xs text-muted">{{ formatNaira(booking.amountPaidKobo) }} paid of {{ formatNaira(booking.priceKobo) }}</p>
            <BaseButton class="mt-3" size="sm" :loading="busy" @click="doPay">Pay securely</BaseButton>
          </div>
          <div v-if="booking.packageName" class="rounded-2xl bg-brand-50 p-3 text-xs font-semibold text-brand-700">Covered by {{ booking.packageName }} · code {{ booking.packageCode }}</div>
          <div v-if="booking.status === 'completed' && booking.reviewToken && !booking.reviewedAt" class="rounded-2xl bg-brand-50 p-4"><p class="text-xs font-bold text-brand-700">How did it go?</p><p class="mt-1 text-xs text-brand-700/80">Leave a quick review for {{ business?.name }}.</p><BaseButton :to="`/review/${booking.reviewToken}`" size="sm" class="mt-3">Leave a review</BaseButton></div>
          <div class="flex flex-wrap gap-2 border-t border-line pt-4">
            <BaseButton v-if="booking.status !== 'cancelled' && booking.status !== 'completed'" size="sm" variant="outline" @click="showReschedule = true"><CalendarDays class="h-4 w-4" /> Reschedule</BaseButton>
            <a :href="calendarUrl()" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-bold"><CalendarPlus class="h-4 w-4" /> Add to calendar</a>
            <a v-if="business?.whatsappNumber || business?.publicPhone" :href="`https://wa.me/${String(business?.whatsappNumber || business?.publicPhone).replace(/\\D/g, '')}`" target="_blank" rel="noopener" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-bold"><MessageCircle class="h-4 w-4" /> Message business</a>
            <button v-if="booking.status !== 'cancelled' && booking.status !== 'completed'" type="button" class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-danger hover:bg-danger/5" @click="showCancel = true"><X class="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      </div>

      <BaseCard class="mt-4 flex flex-col p-0">
        <div class="flex items-center gap-2 border-b border-line p-4"><MessageCircle class="h-4 w-4 text-brand-600" /><div><p class="text-sm font-bold">Messages</p><p class="text-[10px] text-muted">Conversation with {{ business?.name }}</p></div></div>
        <div v-if="chat" class="max-h-[420px] space-y-3 overflow-y-auto p-4">
          <div v-for="message in chat.messages" :key="message.id" class="max-w-[88%]">
            <div class="rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="message.sender === 'customer' ? 'ml-auto bg-forest-900 text-white' : 'bg-raised text-ink'"><p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p><a v-for="image in message.attachments" :key="image" :href="image" target="_blank" rel="noopener" class="mt-2 block overflow-hidden rounded-xl"><img :src="image" alt="Attachment" class="max-h-48 w-full object-cover"></a></div>
            <p class="mt-1 text-[9px] text-muted" :class="message.sender === 'customer' ? 'text-right' : ''">{{ message.sender === 'business' ? business?.name : 'You' }} · {{ when(message.createdAt) }}<span v-if="message.sender === 'customer' && message.seen"> · Seen</span></p>
          </div>
          <p v-if="!chat.messages.length" class="py-8 text-center text-xs text-muted">No messages yet. Ask about your appointment here.</p>
        </div>
        <div v-else class="p-4 text-center text-xs text-muted">Loading conversation…</div>
        <div class="border-t border-line p-3">
          <div v-if="chatAttachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised/60 p-2"><img :src="chatAttachment.optimizedUrl" alt="Attachment preview" class="h-10 w-10 rounded-lg object-cover"><button type="button" class="ml-auto text-muted" aria-label="Remove attachment" @click="chatAttachment = null"><X class="h-4 w-4" /></button></div>
          <div class="flex gap-2"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised" aria-label="Attach photo"><MessageCircle class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="chatUploading" @change="addChatAttachment"></label><input v-model="chatDraft" type="text" placeholder="Message the business…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @keyup.enter="sendChat"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="chatSending || chatUploading || (!chatDraft.trim() && !chatAttachment)" aria-label="Send message" @click="sendChat"><MessageCircle class="h-4 w-4" /></button></div>
          <p v-if="chatError" class="mt-2 text-[10px] text-danger">{{ chatError }}</p>
          <p class="mt-2 text-[9px] text-muted">Keep the conversation here so it stays with your booking record.</p>
        </div>
      </BaseCard>

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
