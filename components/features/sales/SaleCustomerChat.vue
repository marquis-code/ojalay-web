<script setup lang="ts">
import { ImagePlus, Loader2, MessageCircle, Mic, Send, Square, X } from 'lucide-vue-next';
import { publicSaleMessagesApi } from '~/api/factories/saleMessagesApi';
import { uploadsApi } from '~/api/factories/uploadsApi';
import type { SaleChatMessage, SupportAttachment } from '~/types';
const props = defineProps<{ token: string; businessName: string }>();
const messages = ref<SaleChatMessage[]>([]);
const draft = ref('');
const loading = ref(true);
const sending = ref(false);
const uploading = ref(false);
const recording = ref(false);
const attachment = ref<SupportAttachment | null>(null);
const error = ref('');
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let poll: ReturnType<typeof setInterval> | null = null;
async function load() {
  if (!props.token) return;
  try { const result = await publicSaleMessagesApi.thread(props.token); messages.value = result.messages; error.value = ''; }
  catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
async function send() {
  if (!draft.value.trim() && !attachment.value) return;
  sending.value = true; error.value = '';
  try { await publicSaleMessagesApi.send(props.token, draft.value.trim(), attachment.value ? [attachment.value] : undefined); draft.value = ''; attachment.value = null; await load(); }
  catch (err) { error.value = (err as Error).message; }
  finally { sending.value = false; }
}
async function addImage(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file) return;
  uploading.value = true;
  try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(file); }
  catch (err) { error.value = (err as Error).message; }
  finally { uploading.value = false; }
}
async function toggleRecording() {
  if (recording.value) { recorder?.stop(); recording.value = false; return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { error.value = 'Voice notes are not supported in this browser.'; return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = []; recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stream?.getTracks().forEach((track) => track.stop()); recording.value = false;
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      uploading.value = true;
      try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' })); }
      catch (err) { error.value = (err as Error).message; }
      finally { uploading.value = false; }
    };
    recorder.start(); recording.value = true;
  } catch { error.value = 'Allow microphone access to record a voice note.'; }
}
function when(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }); }
onMounted(async () => { await load(); poll = setInterval(() => { if (!sending.value) void load(); }, 5000); });
onBeforeUnmount(() => { if (poll) clearInterval(poll); if (recorder?.state !== 'inactive') recorder?.stop(); stream?.getTracks().forEach((track) => track.stop()); });
</script>

<template>
  <section class="mt-4 overflow-hidden rounded-3xl bg-white shadow-lift">
    <div class="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
      <div class="flex items-center gap-2"><div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><MessageCircle class="h-4 w-4" /></div><div><p class="text-xs font-bold">Chat with {{ businessName }}</p><p class="text-[10px] text-muted">About this sale · messages are saved for you</p></div></div>
      <span class="rounded-full bg-raised px-2.5 py-1 text-[9px] font-bold text-muted">Private</span>
    </div>
    <div class="max-h-[360px] space-y-3 overflow-y-auto bg-[#FBF7EF] p-4 sm:p-6">
      <div v-if="loading" class="flex justify-center py-6"><Loader2 class="h-5 w-5 animate-spin text-brand-500" /></div>
      <div v-for="message in messages" :key="message.id" class="flex w-full max-w-[88%] flex-col" :class="message.sender === 'customer' ? 'ml-auto items-end' : 'items-start'">
        <div class="w-fit max-w-full break-words rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed" :class="message.sender === 'customer' ? 'bg-forest-900 text-white' : 'border border-line bg-white text-forest-900'">
          <p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p>
          <template v-for="asset in message.attachments || []" :key="asset.url"><img v-if="asset.type === 'image'" :src="asset.url" alt="Attachment" class="mt-2 max-h-52 w-full min-w-[170px] rounded-xl object-cover"><audio v-else :src="asset.url" controls class="mt-2 w-full min-w-[210px]"></audio></template>
        </div>
        <p class="mt-1 text-[9px] text-muted" :class="message.sender === 'customer' ? 'text-right' : 'text-left'">{{ message.sender === 'business' ? businessName : 'You' }} · {{ when(message.createdAt) }}</p>
      </div>
      <p v-if="!messages.length && !loading" class="py-6 text-center text-xs text-muted">Ask about delivery, pickup or anything else about this sale.</p>
    </div>
    <div class="border-t border-line p-3 sm:p-4">
      <p v-if="uploading || sending" class="mb-2 flex items-center gap-2 text-[10px] font-semibold text-brand-600"><Loader2 class="h-3.5 w-3.5 animate-spin" /> {{ uploading ? 'Uploading attachment…' : 'Sending message…' }}</p>
      <div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised p-2"><img v-if="attachment.type === 'image'" :src="attachment.url" alt="Preview" class="h-10 w-10 rounded-lg object-cover"><audio v-else :src="attachment.url" controls class="h-9 min-w-0 flex-1"></audio><button type="button" class="ml-auto text-muted" @click="attachment = null"><X class="h-4 w-4" /></button></div>
      <div class="flex gap-1.5"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addImage"></label><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" :class="recording ? 'bg-danger text-white' : 'text-muted'" :disabled="uploading" @click="toggleRecording"><Square v-if="recording" class="h-4 w-4" /><Mic v-else class="h-4 w-4" /></button><input v-model="draft" type="text" placeholder="Message the business…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-xs" @keyup.enter="send"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" @click="send"><Loader2 v-if="sending" class="h-4 w-4 animate-spin" /><Send v-else class="h-4 w-4" /></button></div>
      <p v-if="error" class="mt-2 text-[10px] text-danger">{{ error }}</p>
    </div>
  </section>
</template>
