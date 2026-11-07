<script setup lang="ts">
import { ImagePlus, MessageCircle, Mic, Send, Square, X } from 'lucide-vue-next';
import { supportApi } from '~/api/factories/supportApi';
const props = withDefaults(defineProps<{ showWhatsApp?: boolean }>(), { showWhatsApp: true });
const auth = useAuthStore();
import type { SupportAttachment, SupportChatMessage } from '~/types';
import { uploadsApi } from '~/api/factories/uploadsApi';
const STORAGE_KEY = 'ojaly.support.token';
const open = ref(false);
const token = ref('');
const conversationId = ref('');
const messages = ref<SupportChatMessage[]>([]);
const step = ref<'form' | 'chat'>('form');
const form = reactive({ name: '', email: '', phone: '' });
const draft = ref('');
const loading = ref(false);
const sending = ref(false);
const error = ref('');
const started = ref(false);
const attachment = ref<SupportAttachment | null>(null);
const uploading = ref(false);
const recording = ref(false);
const adminTyping = ref(false);
let lastTypingSent = 0;
let recorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;
let poll: ReturnType<typeof setInterval> | null = null;
const whatsapp = 'https://wa.me/2348052854256?text=' + encodeURIComponent('Hi Ojaly support, I have a question.');

function scrollToBottom() { nextTick(() => { document.getElementById('ojaly-support-messages')?.scrollTo({ top: 999999, behavior: 'smooth' }); }); }
async function loadThread() {
  if (!token.value) return;
  try {
    const result = await supportApi.thread(token.value);
    conversationId.value = result.conversation.id;
    messages.value = result.messages;
    adminTyping.value = Boolean(result.typing?.admin);
    step.value = 'chat';
    scrollToBottom();
  } catch {
    localStorage.removeItem(STORAGE_KEY); token.value = ''; step.value = 'form';
  }
}
async function startChat() {
  error.value = '';
  if (form.name.trim().length < 2) { error.value = 'Enter your name.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) { error.value = 'Enter a valid email address.'; return; }
  if (!/^\+?[\d\s()-]{7,20}$/.test(form.phone)) { error.value = 'Enter a valid phone number.'; return; }
  loading.value = true;
  try {
    const result = await supportApi.start({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    token.value = result.token || '';
    if (token.value) localStorage.setItem(STORAGE_KEY, token.value);
    conversationId.value = result.conversation.id;
    messages.value = result.messages || [];
    adminTyping.value = Boolean(result.typing?.admin);
    step.value = 'chat';
    started.value = true;
    scrollToBottom();
  } catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
async function send() {
  if ((!draft.value.trim() && !attachment.value) || !token.value) return;
  sending.value = true; error.value = '';
  try { await supportApi.send(token.value, draft.value.trim(), attachment.value ? [attachment.value] : undefined); draft.value = ''; attachment.value = null; await loadThread(); scrollToBottom(); }
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
    const chunks: Blob[] = [];
    recorder = new MediaRecorder(recordingStream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      recordingStream?.getTracks().forEach((track) => track.stop());
      recording.value = false;
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      const file = new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' });
      uploading.value = true;
      try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(file); }
      catch (err) { error.value = (err as Error).message; }
      finally { uploading.value = false; }
    };
    recorder.start();
    recording.value = true;
  } catch { error.value = 'Allow microphone access to record a voice note.'; }
}
function notifyTyping() {
  if (!token.value) return;
  const now = Date.now();
  if (now - lastTypingSent < 1800) return;
  lastTypingSent = now;
  void supportApi.typing(token.value).catch(() => undefined);
}
function toggle() {
  open.value = !open.value;
  if (open.value) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { token.value = saved; void loadThread(); }
    if (!poll) poll = setInterval(() => { if (open.value && token.value) void loadThread(); }, 3000);
  }
}
onMounted(() => {
  if (auth.isAuthenticated) {
    form.name = auth.user?.name || '';
    form.email = auth.user?.email || '';
    form.phone = auth.user?.phone || '';
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { token.value = saved; void loadThread(); }
});
onBeforeUnmount(() => { if (poll) clearInterval(poll); if (recorder && recorder.state !== 'inactive') recorder.stop(); recordingStream?.getTracks().forEach((track) => track.stop()); });
function when(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }); }
</script>

<template>
  <div class="fixed bottom-5 right-4 z-[90] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
    <Transition name="chat-pop">
      <div v-if="open" class="mb-1 flex h-[min(620px,78vh)] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
        <header class="flex items-center justify-between bg-forest-900 px-4 py-3 text-white">
          <div class="flex items-center gap-2.5"><div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500"><MessageCircle class="h-4 w-4" /></div><div><p class="text-xs font-bold">Ojaly support</p><p class="text-[9px] text-white/55">We usually reply in a few minutes</p></div></div>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close chat" @click="open = false"><X class="h-4 w-4" /></button>
        </header>
        <template v-if="step === 'form'">
          <div class="flex-1 overflow-y-auto p-4">
            <p class="text-sm font-bold">Hi there 👋</p>
            <p class="mt-1 text-xs leading-relaxed text-muted">Tell us who you are so we can follow up properly. A real Ojaly team member will reply here.</p>
            <form class="mt-4 space-y-3" @submit.prevent="startChat">
              <BaseInput v-model="form.name" label="Your name" placeholder="First and last name" required />
              <BaseInput v-model="form.email" label="Email" type="email" placeholder="you@example.com" required />
              <BaseInput v-model="form.phone" label="Mobile number" type="tel" placeholder="0803 123 4567" required />
              <p v-if="error" class="rounded-xl bg-danger/10 p-2.5 text-[11px] font-medium text-danger">{{ error }}</p>
              <BaseButton type="submit" block :loading="loading">Start chat</BaseButton>
              <p class="text-center text-[9px] leading-relaxed text-muted">We use these details only to follow up on this conversation.</p>
            </form>
          </div>
        </template>
        <template v-else>
          <div id="ojaly-support-messages" class="flex-1 space-y-3 overflow-y-auto bg-canvas/40 p-4">
            <div class="rounded-2xl bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-800">You’re connected to Ojaly support. Ask about booking, payments, a business account or anything else.</div>
            <div v-for="message in messages" :key="message.id" class="max-w-[88%]"><div class="rounded-2xl px-3 py-2 text-xs leading-relaxed" :class="message.sender === 'visitor' ? 'ml-auto bg-forest-900 text-white' : 'bg-surface text-ink shadow-sm'"><p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p><template v-for="asset in message.attachments || []" :key="asset.url"><img v-if="asset.type === 'image'" :src="asset.url" alt="Attachment" class="mt-2 max-h-52 w-full rounded-xl object-cover"><audio v-else :src="asset.url" controls class="mt-2 w-full"></audio></template></div><p class="mt-1 text-[9px] text-muted" :class="message.sender === 'visitor' ? 'text-right' : ''">{{ message.sender === 'admin' ? (message.senderName || 'Ojaly support') : 'You' }} · {{ when(message.createdAt) }}</p></div>
            <div v-if="!messages.length" class="py-10 text-center text-xs text-muted">Send your first message below.</div>
          </div>
          <div class="border-t border-line p-3">
            <p v-if="adminTyping" class="mb-2 text-[10px] font-semibold text-brand-600 animate-pulse">Ojaly support is typing…</p>
            <div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised/60 p-2"><img v-if="attachment.type === 'image'" :src="attachment.url" alt="Attachment preview" class="h-10 w-10 rounded-lg object-cover"><audio v-else :src="attachment.url" controls class="h-9 min-w-0 flex-1"></audio><button type="button" class="ml-auto text-muted" aria-label="Remove attachment" @click="attachment = null"><X class="h-4 w-4" /></button></div>
            <div class="flex gap-1.5"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised" aria-label="Attach image"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addImage"></label><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" :class="recording ? 'bg-danger text-white' : 'text-muted hover:bg-raised'" :disabled="uploading" :aria-label="recording ? 'Stop recording' : 'Record voice note'" @click="toggleRecording"><Square v-if="recording" class="h-4 w-4" /><Mic v-else class="h-4 w-4" /></button><input v-model="draft" type="text" placeholder="Write a message…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-xs" @input="notifyTyping" @keyup.enter="send"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" aria-label="Send message" @click="send"><Send class="h-4 w-4" /></button></div>
            <p v-if="recording" class="mt-2 text-[10px] font-semibold text-danger">Recording… tap the square to attach the voice note.</p>
            <p v-if="error" class="mt-2 text-[10px] text-danger">{{ error }}</p><p class="mt-2 text-[9px] text-muted">Replies arrive here. Images and voice notes are supported.</p>
          </div>
        </template>
      </div>
    </Transition>
    <button type="button" class="flex h-14 w-14 items-center justify-center rounded-full bg-forest-900 text-white shadow-xl transition hover:scale-105" :aria-label="open ? 'Close support chat' : 'Open support chat'" @click="toggle"><X v-if="open" class="h-6 w-6" /><MessageCircle v-else class="h-6 w-6" /></button>
  </div>

  <a v-if="props.showWhatsApp" :href="whatsapp" target="_blank" rel="noopener noreferrer" class="fixed bottom-5 left-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 sm:bottom-6 sm:left-6" aria-label="Chat with Ojaly on WhatsApp"><svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
</template>

<style scoped>
.chat-pop-enter-active, .chat-pop-leave-active { transition: opacity .2s ease, transform .2s cubic-bezier(.16,1,.3,1); }
.chat-pop-enter-from, .chat-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.97); }
</style>
