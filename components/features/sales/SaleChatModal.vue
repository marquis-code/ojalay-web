<script setup lang="ts">
import { ImagePlus, Loader2, MessageCircle, Mic, Send, Square, X } from 'lucide-vue-next';
import { saleMessagesApi } from '~/api/factories/saleMessagesApi';
import { uploadsApi } from '~/api/factories/uploadsApi';
import type { SaleChatMessage, SaleChatThread, SupportAttachment } from '~/types';
const props = defineProps<{ open: boolean; saleId: string }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();
const visible = computed({ get: () => props.open, set: (value) => emit('update:open', value) });
const toast = useToast();
const thread = ref<SaleChatThread | null>(null);
const messages = ref<SaleChatMessage[]>([]);
const draft = ref('');
const loading = ref(false);
const sending = ref(false);
const uploading = ref(false);
const recording = ref(false);
const attachment = ref<SupportAttachment | null>(null);
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let poll: ReturnType<typeof setInterval> | null = null;
const saleTitle = computed(() => thread.value?.sale.saleNumber || 'Sale conversation');
function scroll() { nextTick(() => document.getElementById('sale-chat-messages')?.scrollTo({ top: 999999, behavior: 'smooth' })); }
async function load() {
  if (!props.open || !props.saleId) return;
  try { const result = await saleMessagesApi.thread(props.saleId); thread.value = result; messages.value = result.messages; scroll(); }
  catch (error) { toast.error((error as Error).message); }
}
async function send() {
  if (!draft.value.trim() && !attachment.value) return;
  sending.value = true;
  try { await saleMessagesApi.send(props.saleId, draft.value.trim(), attachment.value ? [attachment.value] : undefined); draft.value = ''; attachment.value = null; await load(); }
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
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = []; recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stream?.getTracks().forEach((track) => track.stop()); recording.value = false;
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      uploading.value = true;
      try { attachment.value = await uploadsApi.uploadPublicSupportAttachment(new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' })); }
      catch (error) { toast.error((error as Error).message); }
      finally { uploading.value = false; }
    };
    recorder.start(); recording.value = true;
  } catch { toast.error('Allow microphone access to record a voice note.'); }
}
function when(value: string) { return new Date(value).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }); }
watch(() => [props.open, props.saleId], async ([open]) => {
  if (open) { loading.value = true; await load(); loading.value = false; if (!poll) poll = setInterval(() => { if (props.open) void load(); }, 5000); }
});
onBeforeUnmount(() => { if (poll) clearInterval(poll); if (recorder?.state !== 'inactive') recorder?.stop(); stream?.getTracks().forEach((track) => track.stop()); });
</script>

<template>
  <BaseModal v-model:open="visible" :title="`Chat · ${saleTitle}`" description="Messages stay with this sale. The customer can return from their receipt." size="lg">
    <div class="flex h-[min(600px,65dvh)] flex-col">
      <div v-if="loading" class="flex flex-1 items-center justify-center"><Loader2 class="h-6 w-6 animate-spin text-brand-500" /></div>
      <div v-else id="sale-chat-messages" class="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-canvas/50 p-3 sm:p-4">
        <div v-for="message in messages" :key="message.id" class="flex w-full max-w-[88%] flex-col" :class="message.sender === 'business' ? 'ml-auto items-end' : 'items-start'">
          <div class="w-fit max-w-full break-words rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed" :class="message.sender === 'business' ? 'bg-brand-500 text-white' : 'border border-line bg-surface text-ink'">
            <p v-if="message.body" class="whitespace-pre-line">{{ message.body }}</p>
            <template v-for="asset in message.attachments || []" :key="asset.url"><img v-if="asset.type === 'image'" :src="asset.url" alt="Attachment" class="mt-2 max-h-52 w-full min-w-[180px] rounded-xl object-cover"><audio v-else :src="asset.url" controls class="mt-2 w-full min-w-[220px]"></audio></template>
          </div>
          <p class="mt-1 text-[9px] text-muted" :class="message.sender === 'business' ? 'text-right' : 'text-left'">{{ message.sender === 'business' ? 'You' : thread?.sale.customerName }} · {{ when(message.createdAt) }}</p>
        </div>
        <div v-if="!messages.length" class="flex h-full flex-col items-center justify-center text-center"><MessageCircle class="h-7 w-7 text-muted" /><p class="mt-2 text-xs font-bold">No messages yet</p><p class="mt-1 max-w-[240px] text-[10px] text-muted">Send the customer a message, image or voice note about this sale.</p></div>
      </div>
      <div class="mt-3 shrink-0 border-t border-line pt-3">
        <p v-if="uploading || sending" class="mb-2 flex items-center gap-2 text-[10px] font-semibold text-brand-600"><Loader2 class="h-3.5 w-3.5 animate-spin" /> {{ uploading ? 'Uploading attachment…' : 'Sending message…' }}</p>
        <div v-if="attachment" class="mb-2 flex items-center gap-2 rounded-xl bg-raised p-2"><img v-if="attachment.type === 'image'" :src="attachment.url" alt="Preview" class="h-10 w-10 rounded-lg object-cover"><audio v-else :src="attachment.url" controls class="h-9 min-w-0 flex-1"></audio><button type="button" class="ml-auto text-muted" @click="attachment = null"><X class="h-4 w-4" /></button></div>
        <div class="flex gap-1.5"><label class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-muted hover:bg-raised"><ImagePlus class="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="addImage"></label><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" :class="recording ? 'bg-danger text-white' : 'text-muted hover:bg-raised'" :disabled="uploading" @click="toggleRecording"><Square v-if="recording" class="h-4 w-4" /><Mic v-else class="h-4 w-4" /></button><input v-model="draft" type="text" placeholder="Message this customer…" class="min-h-[44px] min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 text-xs" @keyup.enter="send"><button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-50" :disabled="sending || uploading || (!draft.trim() && !attachment)" @click="send"><Loader2 v-if="sending" class="h-4 w-4 animate-spin" /><Send v-else class="h-4 w-4" /></button></div>
      </div>
    </div>
  </BaseModal>
</template>
