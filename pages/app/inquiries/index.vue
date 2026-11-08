<script setup lang="ts">
import { ArrowLeft, ExternalLink, ImagePlus, Loader2, MessageCircle, Mic, RefreshCw, Send, Square, X } from 'lucide-vue-next';
import { storefrontChatApi } from '~/api/factories/storefrontChatApi';
import { uploadsApi } from '~/api/factories/uploadsApi';
import type { SupportAttachment } from '~/types';
import { useBusinessStore } from '~/stores/business';
import { formatDateTime } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Inquiries' });
const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const toast = useToast();
const conversations = ref<Record<string, any>[]>([]);
const selectedId = ref('');
const thread = ref<Record<string, any> | null>(null);
const draft = ref('');
const loading = ref(false);
const sending = ref(false);
const attachment = ref<SupportAttachment | null>(null);
const uploading = ref(false);
const recording = ref(false);
let recorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const selectedConversation = computed(() => conversations.value.find((item) => item.id === selectedId.value) || thread.value?.conversation || null);
const contextLink = computed(() => {
  const c = selectedConversation.value;
  if (!c || c.contextType === 'general' || !c.contextId) return '';
  return `/s/${businessStore.business?.slug}/${c.contextType === 'product' ? 'products' : 'services'}/${c.contextId}`;
});
async function load() {
  try { conversations.value = await storefrontChatApi.conversations(); }
  catch (error) { toast.error((error as Error).message); }
  const requested = typeof route.query.thread === 'string' ? route.query.thread : '';
  const next = requested || selectedId.value || conversations.value[0]?.id;
  if (next && next !== selectedId.value) await open(next);
}
async function open(id: string) {
  selectedId.value = id; loading.value = true;
  if (String(route.query.thread || '') !== id) void router.replace({ query: { ...route.query, thread: id } });
  try { thread.value = await storefrontChatApi.thread(id); }
  catch (error) { toast.error((error as Error).message); }
  finally { loading.value = false; }
}
async function send() {
  if (!thread.value || (!draft.value.trim() && !attachment.value)) return;
  sending.value = true;
  try { await storefrontChatApi.reply(thread.value.conversation.id, draft.value.trim(), attachment.value ? [attachment.value] : undefined); draft.value = ''; attachment.value = null; thread.value = await storefrontChatApi.thread(thread.value.conversation.id); await loadConversations(); }
  catch (error) { toast.error((error as Error).message); }
  finally { sending.value = false; }
}
async function addImage(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file) return;
  uploading.value = true;
  try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(file); }
  catch (error) { toast.error((error as Error).message); }
  finally { uploading.value = false; }
}
async function toggleRecording() {
  if (recording.value) { recorder?.stop(); recording.value = false; return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { toast.error('Voice notes are not supported in this browser.'); return; }
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = []; recorder = new MediaRecorder(recordingStream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      recordingStream?.getTracks().forEach((track) => track.stop()); recording.value = false;
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      uploading.value = true;
      try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' })); }
      catch (error) { toast.error((error as Error).message); }
      finally { uploading.value = false; }
    };
    recorder.start(); recording.value = true;
  } catch { toast.error('Allow microphone access to record a voice note.'); }
}
async function loadConversations() { try { conversations.value = await storefrontChatApi.conversations(); } catch { /* keep current */ } }
async function closeConversation() {
  if (!thread.value) return;
  try { await storefrontChatApi.close(thread.value.conversation.id); toast.success('Conversation closed.'); await loadConversations(); }
  catch (error) { toast.error((error as Error).message); }
}
function back() { selectedId.value = ''; thread.value = null; void router.replace({ query: {} }); }
function when(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }); }
onMounted(async () => { await load(); timer = setInterval(async () => { await loadConversations(); if (selectedId.value) { try { thread.value = await storefrontChatApi.thread(selectedId.value); } catch { /* keep */ } } }, 5000); });
onBeforeUnmount(() => { if (timer) clearInterval(timer); if (recorder?.state !== 'inactive') recorder?.stop(); recordingStream?.getTracks().forEach((track) => track.stop()); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Inquiries" subtitle="Talk to customers before they order or book. Replies stay attached to their Ojaly record." eyebrow="Customer care">
      <template #actions><BaseButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-4 w-4" /> Refresh</BaseButton></template>
    </PageHeader>
    <div class="grid min-h-[620px] gap-4 lg:grid-cols-[360px_1fr]">
      <div class="card flex min-h-0 flex-col overflow-hidden" :class="selectedId ? 'hidden lg:flex' : 'flex'">
        <div class="flex items-center justify-between border-b border-line p-4"><p class="text-sm font-bold">Conversations</p><span class="text-[10px] text-muted">{{ conversations.length }}</span></div>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <button v-for="item in conversations" :key="item.id" type="button" class="w-full border-b border-line p-4 text-left hover:bg-raised/50" :class="selectedId === item.id ? 'bg-raised/60' : ''" @click="open(item.id)">
            <div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="truncate text-sm font-bold">{{ item.name }}</p><p class="mt-0.5 truncate text-[10px] text-muted">{{ item.contextName || 'General enquiry' }}</p></div><span v-if="item.unreadAdmin" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">{{ item.unreadAdmin }}</span></div>
            <div class="mt-2 flex justify-between text-[9px] text-muted"><span>{{ formatDateTime(item.lastMessageAt || item.createdAt) }}</span><span class="capitalize">{{ item.status }}</span></div>
          </button>
          <div v-if="!conversations.length" class="p-8 text-center"><MessageCircle class="mx-auto h-7 w-7 text-muted" /><p class="mt-3 text-sm font-bold">No inquiries yet</p><p class="mt-1 text-[11px] leading-relaxed text-muted">When a customer asks about a product or service from your storefront, the conversation appears here.</p></div>
        </div>
      </div>
      <div v-if="thread" class="card flex min-h-0 flex-col overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
          <div class="flex items-center gap-2"><button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-line lg:hidden" aria-label="Back to inquiries" @click="back"><ArrowLeft class="h-4 w-4" /></button><div><p class="text-sm font-bold">{{ thread.conversation.name }}</p><p class="mt-0.5 text-[10px] text-muted">{{ thread.conversation.phone }}<span v-if="thread.conversation.email"> · {{ thread.conversation.email }}</span></p></div></div>
          <div class="flex gap-2"><NuxtLink v-if="contextLink" :to="contextLink" target="_blank" class="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold">View context <ExternalLink class="h-3 w-3" /></NuxtLink><button type="button" class="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold text-danger" @click="closeConversation"><X class="h-3 w-3" /> Close</button></div>
        </div>
        <div class="border-b border-line bg-raised/30 px-4 py-2.5 text-[10px] text-muted"><span class="font-bold text-ink">{{ thread.conversation.contextName || 'General enquiry' }}</span> · Replies stay in Ojaly and are attached to the customer record.</div>
        <div class="min-h-0 flex-1 space-y-3 overflow-y-auto bg-canvas/30 p-4">
          <div v-for="message in thread.messages" :key="message.id" class="flex max-w-[88%] flex-col" :class="message.sender === 'business' ? 'ml-auto items-end' : 'items-start'"><div class="w-fit max-w-full break-words rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed" :class="message.sender === 'business' ? 'bg-brand-500 text-white' : 'border border-line bg-surface text-ink'"><p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p><template v-for="asset in message.attachments || []" :key="asset.url"><img v-if="asset.type === 'image'" :src="asset.url" alt="Attachment" class="mt-2 max-h-52 w-full min-w-[170px] rounded-xl object-cover"><audio v-else :src="asset.url" controls class="mt-2 w-full min-w-[210px]"></audio></template></div><p class="mt-1 text-[9px] text-muted">{{ message.sender === 'business' ? 'You' : thread.conversation.name }} · {{ when(message.createdAt) }}</p></div>
          <p v-if="!thread.messages.length" class="py-12 text-center text-xs text-muted">No messages yet. Reply below.</p>
        </div>
        <div class="border-t border-line p-3"><p v-if="uploading || sending" class="mb-2 flex items-center gap-2 text-[10px] font-semibold text-brand-600"><Loader2 class="h-3.5 w-3.5 animate-spin" /> {{ uploading ? 'Uploading attachment…' : 'Sending reply…' }}</p><div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised p-2"><img v-if="attachment.type === 'image'" :src="attachment.url" alt="Preview" class="h-10 w-10 rounded-lg object-cover"><audio v-else :src="attachment.url" controls class="h-9 min-w-0 flex-1"></audio><button type="button" class="ml-auto text-muted" @click="attachment = null"><X class="h-4 w-4" /></button></div><div class="flex gap-1.5"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addImage"></label><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" :class="recording ? 'bg-danger text-white' : 'text-muted hover:bg-raised'" :disabled="uploading" @click="toggleRecording"><Square v-if="recording" class="h-4 w-4" /><Mic v-else class="h-4 w-4" /></button><input v-model="draft" type="text" placeholder="Reply inside Ojaly…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 text-xs" @keyup.enter="send"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" aria-label="Send reply" @click="send"><Loader2 v-if="sending" class="h-4 w-4 animate-spin" /><Send v-else class="h-4 w-4" /></button></div><p class="mt-2 text-[9px] text-muted">The customer sees this in their in-app chat. A WhatsApp/email alert is sent when they message you.</p></div>
      </div>
      <div v-else class="card hidden min-h-0 items-center justify-center text-center lg:flex"><div><MessageCircle class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">Select a conversation</p><p class="mt-1 text-xs text-muted">Customer questions from your storefront appear here.</p></div></div>
    </div>
  </div>
</template>
