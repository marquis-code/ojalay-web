<script setup lang="ts">
import { ImagePlus, MessageCircle, Send, X } from 'lucide-vue-next';
import { useBookingMessages } from '~/composables/useBookingMessages';
import { uploadsApi } from '~/api/factories/uploadsApi';
import type { BookingMessage } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Messages' });
const toast = useToast();
const { inbox, thread, loading, sending, loadInbox, open, send } = useBookingMessages();
const selectedId = ref('');
const draft = ref('');
const attachment = ref<{ url: string; optimizedUrl: string } | null>(null);
const uploading = ref(false);
const quickReplies = ['Your appointment is confirmed.', 'Please arrive 5 minutes early.', 'I’m running a little behind — see you shortly.', 'Could you send a reference photo?'];
function when(value: string) { return new Date(value).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
async function select(bookingId: string) { selectedId.value = bookingId; await open(bookingId); }
async function sendMessage(body?: string) {
  const text = (body ?? draft.value).trim();
  if (!text && !attachment.value) return;
  try {
    await send({ body: text || undefined, attachments: attachment.value ? [attachment.value.url] : undefined });
    draft.value = ''; attachment.value = null;
  } catch (error) { toast.error((error as Error).message); }
}
async function addAttachment(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0]; input.value = '';
  if (!file) return;
  uploading.value = true;
  try { attachment.value = await uploadsApi.uploadPublicRequestImage(file); }
  catch (error) { toast.error((error as Error).message); }
  finally { uploading.value = false; }
}
function isSeen(message: BookingMessage) { return message.sender === 'business' && message.seen; }
onMounted(async () => { await loadInbox(); if (inbox.value[0]) await select(inbox.value[0].bookingId); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Messages" subtitle="Every customer conversation, attached to its booking and its record." eyebrow="Inbox">
      <template #actions><BaseButton variant="outline" :loading="loading" @click="loadInbox">Refresh</BaseButton></template>
    </PageHeader>
    <div class="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <BaseCard class="p-0">
        <div class="flex items-center justify-between border-b border-line p-4"><h2 class="font-display text-lg font-bold">Conversations</h2><span class="text-[10px] font-semibold text-muted">{{ inbox.length }}</span></div>
        <div v-if="loading && !inbox.length" class="space-y-2 p-3"><div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" /></div>
        <div v-else-if="inbox.length" class="divide-y divide-line">
          <button v-for="item in inbox" :key="item.bookingId" type="button" class="w-full p-4 text-left transition hover:bg-raised/50" :class="selectedId === item.bookingId ? 'bg-raised/60' : ''" @click="select(item.bookingId)">
            <div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="truncate text-xs font-bold">{{ item.customerName }}</p><p class="mt-0.5 truncate text-[10px] text-muted">{{ item.serviceName }} · {{ item.bookingNumber }}</p></div><span v-if="item.unread" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">{{ item.unread }}</span></div>
            <p class="mt-2 line-clamp-1 text-[11px] text-muted">{{ item.lastSender === 'business' ? 'You: ' : '' }}{{ item.lastMessage || 'Attachment' }}</p>
            <p class="mt-1 text-[9px] text-muted">{{ item.lastMessageAt ? when(item.lastMessageAt) : when(item.startAt) }}</p>
          </button>
        </div>
        <div v-else class="p-8 text-center"><MessageCircle class="mx-auto h-7 w-7 text-muted" /><p class="mt-3 text-sm font-bold">No conversations yet.</p><p class="mt-1 text-xs leading-relaxed text-muted">When a customer sends a message from their booking page, it appears here.</p></div>
      </BaseCard>

      <BaseCard v-if="thread" class="flex min-h-[560px] flex-col p-0">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4"><div><p class="text-sm font-bold">{{ thread.booking.customerName }}</p><p class="mt-0.5 text-[10px] text-muted">{{ thread.booking.serviceName }} · {{ thread.booking.bookingNumber }} · {{ when(thread.booking.startAt) }}</p></div><NuxtLink :to="`/booking/${thread.booking.publicToken}`" target="_blank" class="text-[10px] font-bold text-brand-600">Customer view</NuxtLink></div>
        <div class="flex-1 space-y-3 overflow-y-auto p-4">
          <div v-for="message in thread.messages" :key="message.id" class="max-w-[88%]">
            <div class="rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="message.sender === 'business' ? 'ml-auto bg-forest-900 text-white' : 'bg-raised text-ink'"><p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p><a v-for="image in message.attachments" :key="image" :href="image" target="_blank" rel="noopener" class="mt-2 block overflow-hidden rounded-xl"><img :src="image" alt="Attachment" class="max-h-56 w-full object-cover"></a></div>
            <p class="mt-1 text-[9px] text-muted" :class="message.sender === 'business' ? 'text-right' : ''">{{ message.sender === 'business' ? 'You' : message.senderName }} · {{ when(message.createdAt) }} <span v-if="isSeen(message)">· Seen</span></p>
          </div>
          <div v-if="!thread.messages.length" class="flex h-full min-h-[280px] items-center justify-center text-center"><div><MessageCircle class="mx-auto h-7 w-7 text-muted" /><p class="mt-2 text-xs text-muted">Start the conversation. Replies stay attached to this booking.</p></div></div>
        </div>
        <div class="border-t border-line p-3">
          <div class="mb-2 flex flex-wrap gap-1"><button v-for="reply in quickReplies" :key="reply" type="button" class="rounded-full border border-line px-2.5 py-1 text-[9px] font-semibold text-muted hover:bg-raised" @click="sendMessage(reply)">{{ reply }}</button></div>
          <div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised/60 p-2"><img :src="attachment.optimizedUrl" alt="Attachment preview" class="h-10 w-10 rounded-lg object-cover"><button type="button" class="ml-auto text-muted" aria-label="Remove attachment" @click="attachment = null"><X class="h-4 w-4" /></button></div>
          <div class="flex gap-2"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised" aria-label="Attach photo"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addAttachment"></label><input v-model="draft" type="text" placeholder="Reply inside Ojaly…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @keyup.enter="sendMessage()"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" aria-label="Send message" @click="sendMessage()"><Send class="h-4 w-4" /></button></div>
          <p class="mt-2 text-[9px] text-muted">Phone numbers and external links are hidden automatically. Replies are tied to the booking record.</p>
        </div>
      </BaseCard>
      <BaseCard v-else class="flex min-h-[560px] items-center justify-center text-center"><div><MessageCircle class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">Select a conversation</p><p class="mt-1 text-xs text-muted">Messages appear alongside the booking they belong to.</p></div></BaseCard>
    </div>
  </div>
</template>
