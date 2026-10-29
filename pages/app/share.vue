<script setup lang="ts">
import { Check, Copy, Download, MessageCircle, QrCode, Share2 } from 'lucide-vue-next';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Share my shop' });

const toast = useToast();
const businessStore = useBusinessStore();
const config = useRuntimeConfig();
const card = ref<HTMLElement | null>(null);
const qr = ref('');
const downloading = ref(false);
const copied = ref(false);
const canShare = ref(false);
const business = computed(() => businessStore.business);
const isService = computed(() => business.value?.businessMode === 'services' || business.value?.businessMode === 'hybrid');
const path = computed(() => isService.value ? `/s/${business.value?.slug}/services` : `/s/${business.value?.slug}`);
const url = computed(() => `${String(config.public.appUrl).replace(/\/$/, '')}${path.value}`);
const qrCode = computed(() => qr.value);
const shareText = computed(() => `Buy from ${business.value?.name || 'my shop'} on Ojaly: ${url.value}`);

async function makeQr() {
  if (!url.value || !business.value?.slug) return;
  qr.value = await QRCode.toDataURL(url.value, { width: 720, margin: 1, color: { dark: '#06231A', light: '#FFFFFF' } });
}
async function copy() {
  try { await navigator.clipboard.writeText(url.value); copied.value = true; toast.success('Shop link copied.'); setTimeout(() => { copied.value = false; }, 1800); }
  catch { toast.error('Could not copy. Select the link manually.'); }
}
async function share() {
  if (!canShare.value) return;
  try { await navigator.share({ title: business.value?.name, text: shareText.value, url: url.value }); }
  catch { /* dismissed */ }
}
function downloadQr() {
  if (!qr.value) return;
  const a = document.createElement('a'); a.href = qr.value; a.download = `${business.value?.slug || 'ojaly'}-qr.png`; a.click();
}
async function downloadCard() {
  if (!card.value) return;
  downloading.value = true;
  try {
    const data = await toPng(card.value, { pixelRatio: 2, backgroundColor: '#F4F1E8' });
    const a = document.createElement('a'); a.href = data; a.download = `${business.value?.slug || 'ojaly'}-shop-card.png`; a.click();
    toast.success('Shop card downloaded.');
  } catch (error) { toast.error((error as Error).message); }
  finally { downloading.value = false; }
}
onMounted(async () => {
  canShare.value = typeof navigator !== 'undefined' && Boolean(navigator.share); if (!businessStore.context) await businessStore.load(); await makeQr(); });
watch(url, makeQr);
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <PageHeader title="Share my shop" subtitle="One link, one QR code, one card. Put your shop everywhere." eyebrow="Grow">
      <template #actions><BaseButton :loading="downloading" @click="downloadCard"><Download class="h-4 w-4" /> Download card</BaseButton></template>
    </PageHeader>

    <div class="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div ref="card" class="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-[#F4F1E8] p-7 text-forest-900 shadow-chunky">
        <div class="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#E8D26A]" />
        <div class="relative flex items-start justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-900/50">Ojaly shop</p><h2 class="mt-2 max-w-xs font-display text-3xl font-bold leading-none tracking-tight">{{ business?.name || 'Your business' }}</h2><p class="mt-2 max-w-xs text-xs leading-relaxed text-forest-900/60">{{ business?.tagline || 'Shop direct. Pay securely. Support a student business.' }}</p></div><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-[#F4F1E8]"><QrCode class="h-5 w-5" /></div></div>
        <div class="relative mt-7 flex items-center gap-4 rounded-2xl bg-white p-3"><img v-if="qrCode" :src="qrCode" alt="QR code for shop" class="h-28 w-28 shrink-0"><div v-else class="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-forest-900/10" /><div class="min-w-0"><p class="text-[9px] font-bold uppercase tracking-[0.16em] text-forest-900/50">Scan to shop</p><p class="mt-1 break-all text-[11px] font-semibold">{{ url.replace('https://', '') }}</p><p class="mt-2 text-[10px] text-forest-900/50">Free delivery of your shop to every customer.</p></div></div>
        <div class="relative mt-5 flex items-center justify-between border-t border-forest-900/10 pt-3 text-[9px] font-bold uppercase tracking-wider text-forest-900/40"><span>{{ isService ? 'Book a service' : 'Shop the collection' }}</span><span>Powered by Ojaly</span></div>
      </div>

      <div class="space-y-3">
        <BaseCard>
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Your shop link</p>
          <div class="mt-2 flex gap-2"><input :value="url" readonly class="input-base min-w-0 flex-1 !text-[11px]" aria-label="Shop link"><BaseButton variant="outline" @click="copy"><Check v-if="copied" class="h-4 w-4" /><Copy v-else class="h-4 w-4" /> {{ copied ? 'Copied' : 'Copy' }}</BaseButton></div>
          <div class="mt-3 grid gap-2 sm:grid-cols-2"><a :href="`https://wa.me/?text=${encodeURIComponent(shareText)}`" target="_blank" rel="noopener" class="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-forest-900"><MessageCircle class="h-4 w-4" /> Share on WhatsApp</a><a v-if="canShare" href="#" class="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-line px-3 text-xs font-bold" @click.prevent="share"><Share2 class="h-4 w-4" /> Share</a></div>
        </BaseCard>
        <BaseCard>
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Download the QR</p>
          <p class="mt-1 text-xs leading-relaxed text-muted">Print it on packaging, flyers, your laptop or a sticker for your hostel door.</p>
          <BaseButton class="mt-3" variant="outline" :disabled="!qrCode" @click="downloadQr"><Download class="h-4 w-4" /> Download QR PNG</BaseButton>
        </BaseCard>
        <BaseCard class="bg-accent/30">
          <p class="font-display text-lg font-bold">The first shared link is the activation.</p>
          <p class="mt-1 text-xs leading-relaxed text-muted">Send this link to five customers today. Ask them to order through it — not in the DMs. That is how the record becomes real.</p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
