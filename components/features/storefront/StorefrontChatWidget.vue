<script setup lang="ts">
import { ArrowRight, ImagePlus, Loader2, MessageCircle, Mic, Send, Square, X } from 'lucide-vue-next';
import { publicStorefrontChatApi } from '~/api/factories/storefrontChatApi';
import type { StorefrontChatMessage, StorefrontChatThread, SupportAttachment } from '~/types';
import { uploadsApi } from '~/api/factories/uploadsApi';
const props = defineProps<{ business: { id: string; name: string; slug: string; logoUrl?: string | null } }>();
const { open, closeChat, context, openChat } = useStorefrontChat();
const storageKey = computed(() => `ojaly.storefront.chat.${props.business.slug}`);
const token = ref('');
const conversation = ref<StorefrontChatThread['conversation'] | null>(null);
const messages = ref<StorefrontChatMessage[]>([]);
const threadContext = ref<{ type: string; id?: string; name?: string } | null>(null);
const form = reactive({ name: '', phone: '', email: '' });
const draft = ref('');
const step = ref<'form' | 'chat'>('form');
const loading = ref(false);
const sending = ref(false);
const error = ref('');
const attachment = ref<SupportAttachment | null>(null);
const uploading = ref(false);
const recording = ref(false);
let recorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;
let poll: ReturnType<typeof setInterval> | null = null;
const contextLink = computed(() => {
  const item = threadContext.value || context.value;
  if (!item || item.type === 'general' || !item.id) return '';
  return `/s/${props.business.slug}/${item.type === 'product' ? 'products' : 'services'}/${item.id}`;
});
const contextLabel = computed(() => {
  const item = threadContext.value || context.value;
  return item && item.type !== 'general' ? item.name || (item.type === 'product' ? 'Product question' : 'Service question') : 'General enquiry';
});
function reset() { token.value = ''; conversation.value = null; messages.value = []; threadContext.value = null; step.value = 'form'; draft.value = ''; }
async function loadThread() {
  if (!token.value) return;
  try {
    const result = await publicStorefrontChatApi.thread(token.value);
    conversation.value = result.conversation;
    messages.value = result.messages;
    threadContext.value = { type: result.conversation.contextType, id: result.conversation.contextId || undefined, name: result.conversation.contextName };
    step.value = 'chat';
    scroll();
  } catch {
    localStorage.removeItem(storageKey.value); reset();
  }
}
async function start() {
  error.value = '';
  if (form.name.trim().length < 2) { error.value = 'Enter your name.'; return; }
  if (!/^(?:\+?234|0)?[789][01]\d{8}$/.test(form.phone.replace(/\D/g, ''))) { error.value = 'Enter a valid Nigerian phone number.'; return; }
  loading.value = true;
  try {
    const result = await publicStorefrontChatApi.start(props.business.id, {
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined,
      contextType: context.value?.type || 'general', contextId: context.value?.id, contextName: context.value?.name,
    });
    token.value = result.token; localStorage.setItem(storageKey.value, result.token);
    conversation.value = result.conversation; messages.value = result.messages || []; threadContext.value = context.value;
    step.value = 'chat'; scroll();
  } catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
async function send() {
  if ((!draft.value.trim() && !attachment.value) || !token.value) return;
  sending.value = true; error.value = '';
  try { await publicStorefrontChatApi.send(token.value, draft.value.trim(), attachment.value ? [attachment.value] : undefined); draft.value = ''; attachment.value = null; await loadThread(); }
  catch (err) { error.value = (err as Error).message; }
  finally { sending.value = false; }
}
async function addImage(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file) return;
  uploading.value = true; error.value = '';
  try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(file); }
  catch (err) { error.value = (err as Error).message; }
  finally { uploading.value = false; }
}
async function toggleRecording() {
  if (recording.value) { recorder?.stop(); recording.value = false; return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { error.value = 'Voice notes are not supported in this browser.'; return; }
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = []; recorder = new MediaRecorder(recordingStream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      recordingStream?.getTracks().forEach((track) => track.stop()); recording.value = false;
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      uploading.value = true;
      try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' })); }
      catch (err) { error.value = (err as Error).message; }
      finally { uploading.value = false; }
    };
    recorder.start(); recording.value = true;
  } catch { error.value = 'Allow microphone access to record a voice note.'; }
}
function scroll() { nextTick(() => document.getElementById('storefront-chat-messages')?.scrollTo({ top: 999999, behavior: 'smooth' })); }
function when(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }); }
watch(open, (value) => {
  if (!value) { if (poll) { clearInterval(poll); poll = null; } return; }
  const saved = localStorage.getItem(storageKey.value);
  if (saved) { token.value = saved; void loadThread(); } else { reset(); }
  if (!poll) poll = setInterval(() => { if (open.value && token.value) void loadThread(); }, 5000);
});
onMounted(() => { const saved = localStorage.getItem(storageKey.value); if (saved) token.value = saved; });
onBeforeUnmount(() => { if (poll) clearInterval(poll); if (recorder?.state !== 'inactive') recorder?.stop(); recordingStream?.getTracks().forEach((track) => track.stop()); });
</script>

<template>
  <div class="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
    <Transition name="storefront-chat-pop">
      <div v-if="open" class="flex h-[min(620px,78vh)] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl max-sm:fixed max-sm:inset-0 max-sm:z-[100] max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none max-sm:border-0">
        <header class="flex items-center justify-between bg-forest-900 px-4 py-3 text-white">
          <div class="flex min-w-0 items-center gap-2.5"><div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white"><MessageCircle class="h-4 w-4" /></div><div class="min-w-0"><p class="truncate text-xs font-bold">{{ business.name }}</p><p class="truncate text-[9px] text-white/55">Chat inside Ojaly · replies stay with your order</p></div></div>
          <button type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close chat" @click="closeChat"><X class="h-4 w-4" /></button>
        </header>
        <template v-if="step === 'form'">
          <div class="flex-1 overflow-y-auto p-4">
            <div class="rounded-2xl bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-800"><strong>{{ contextLabel }}</strong><p class="mt-1">Ask a question, request a quote or confirm details. The business replies here — not in a separate WhatsApp thread.</p></div>
            <form class="mt-4 space-y-3" @submit.prevent="start">
              <BaseInput v-model="form.name" label="Your name" placeholder="First and last name" required />
              <BaseInput v-model="form.phone" label="Phone number" type="tel" placeholder="0803 123 4567" required />
              <BaseInput v-model="form.email" label="Email (optional)" type="email" placeholder="you@example.com" />
              <p v-if="error" class="rounded-xl bg-danger/10 p-2.5 text-[11px] font-medium text-danger">{{ error }}</p>
              <button type="submit" class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-forest-900 text-sm font-bold text-white disabled:opacity-50" :disabled="loading">{{ loading ? 'Starting chat…' : 'Start chat' }}</button>
              <p class="text-center text-[9px] leading-relaxed text-muted">We use these details only to follow up on this conversation.</p>
            </form>
          </div>
        </template>
        <template v-else>
          <div id="storefront-chat-messages" class="flex-1 space-y-3 overflow-y-auto bg-canvas/40 p-4">
            <NuxtLink v-if="contextLink" :to="contextLink" class="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-3 text-xs font-bold hover:border-brand-400"><span class="truncate">{{ contextLabel }}</span><ArrowRight class="h-4 w-4 shrink-0" /></NuxtLink>
            <div v-for="message in messages" :key="message.id" class="flex w-full max-w-[88%] flex-col" :class="message.sender === 'visitor' ? 'ml-auto items-end' : 'items-start'"><div class="w-fit max-w-full break-words rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="message.sender === 'visitor' ? 'bg-forest-900 text-white' : 'border border-line bg-surface text-ink'"><p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p><template v-for="asset in message.attachments || []" :key="asset.url"><img v-if="asset.type === 'image'" :src="asset.url" alt="Attachment" class="mt-2 max-h-52 w-full min-w-[170px] rounded-xl object-cover"><audio v-else :src="asset.url" controls class="mt-2 w-full min-w-[210px]"></audio></template></div><p class="mt-1 text-[9px] text-muted">{{ message.sender === 'business' ? message.senderName || business.name : 'You' }} · {{ when(message.createdAt) }}</p></div>
            <p v-if="!messages.length" class="py-10 text-center text-xs text-muted">Send your first message below.</p>
          </div>
          <div class="border-t border-line p-3">
            <p v-if="sending" class="mb-2 flex items-center gap-2 text-[10px] font-semibold text-brand-600"><Loader2 class="h-3.5 w-3.5 animate-spin" /> Sending…</p>
            <p v-if="uploading || sending" class="mb-2 flex items-center gap-2 text-[10px] font-semibold text-brand-600"><Loader2 class="h-3.5 w-3.5 animate-spin" /> {{ uploading ? 'Uploading attachment…' : 'Sending message…' }}</p>
            <div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised p-2"><img v-if="attachment.type === 'image'" :src="attachment.url" alt="Preview" class="h-10 w-10 rounded-lg object-cover"><audio v-else :src="attachment.url" controls class="h-9 min-w-0 flex-1"></audio><button type="button" class="ml-auto text-muted" @click="attachment = null"><X class="h-4 w-4" /></button></div>
            <div class="flex gap-1.5"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addImage"></label><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" :class="recording ? 'bg-danger text-white' : 'text-muted hover:bg-raised'" :disabled="uploading" @click="toggleRecording"><Square v-if="recording" class="h-4 w-4" /><Mic v-else class="h-4 w-4" /></button><input v-model="draft" type="text" placeholder="Ask about this cake or service…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @keyup.enter="send"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" aria-label="Send message" @click="send"><Loader2 v-if="sending" class="h-4 w-4 animate-spin" /><Send v-else class="h-4 w-4" /></button></div>
            <p v-if="recording" class="mt-2 text-[10px] font-semibold text-danger">Recording… tap the square to attach the voice note.</p>
            <p v-if="error" class="mt-2 text-[10px] text-danger">{{ error }}</p><p class="mt-2 text-[9px] text-muted">Your conversation stays attached to your Ojaly record.</p>
          </div>
        </template>
      </div>
    </Transition>
    <button type="button" class="flex h-14 w-14 items-center justify-center rounded-full bg-forest-900 text-white shadow-xl transition hover:scale-105" :aria-label="open ? 'Close chat' : 'Chat with business'" @click="open ? closeChat() : openChat(context || { type: 'general' })"><X v-if="open" class="h-6 w-6" /><MessageCircle v-else class="h-6 w-6" /></button>
  </div>
</template>

<style scoped>
.storefront-chat-pop-enter-active, .storefront-chat-pop-leave-active { transition: opacity .2s ease, transform .2s cubic-bezier(.16,1,.3,1); }
.storefront-chat-pop-enter-from, .storefront-chat-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.97); }
</style>
