<script setup lang="ts">
import { ArrowUpRight, Download, Share2, Sparkles, TrendingUp } from 'lucide-vue-next';
import { toPng } from 'html-to-image';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Weekly report card' });

const toast = useToast();
const businessStore = useBusinessStore();
const dashboard = useDashboard();
const card = ref<HTMLElement | null>(null);
const downloading = ref(false);
const range = ref<'week' | 'month'>('week');
const business = computed(() => businessStore.business);
const summary = computed(() => dashboard.data.value?.summary);
const top = computed(() => dashboard.data.value?.bestSellers?.[0]);
const period = computed(() => dashboard.data.value?.range?.label || (range.value === 'week' ? 'This week' : 'This month'));
async function load() { if (!businessStore.context) await businessStore.load(); await dashboard.load(range.value); }
async function download() {
  if (!card.value) return;
  downloading.value = true;
  try {
    const data = await toPng(card.value, { pixelRatio: 2, backgroundColor: '#F4F1E8' });
    const a = document.createElement('a'); a.href = data; a.download = `${business.value?.slug || 'ojaly'}-report-${range.value}.png`; a.click();
    toast.success('Report card downloaded. Post it on WhatsApp status.');
  } catch (error) { toast.error((error as Error).message); }
  finally { downloading.value = false; }
}
async function share() {
  const text = `${business.value?.name || 'My business'} — ${period.value}: ${formatNaira(summary.value?.revenueKobo)} revenue, ${formatNaira(summary.value?.profitKobo)} profit, ${summary.value?.salesCount || 0} sales. Powered by Ojaly.`;
  if (navigator.share) { try { await navigator.share({ title: 'My business report', text }); return; } catch { /* dismissed */ } }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
onMounted(load);
watch(range, load);
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <PageHeader title="Weekly report card" subtitle="A clean snapshot of the week you can post, send or keep." eyebrow="Reports">
      <template #actions><BaseButton variant="outline" @click="share"><Share2 class="h-4 w-4" /> Share</BaseButton><BaseButton :loading="downloading" @click="download"><Download class="h-4 w-4" /> Download PNG</BaseButton></template>
    </PageHeader>
    <div class="flex gap-2"><button v-for="r in [{ value: 'week', label: 'This week' }, { value: 'month', label: 'This month' }]" :key="r.value" type="button" class="rounded-full border px-3.5 py-2 text-[11px] font-bold" :class="range === r.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="range = r.value as 'week' | 'month'">{{ r.label }}</button></div>

    <div ref="card" class="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-[#F4F1E8] p-7 text-forest-900 shadow-chunky sm:p-9">
      <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E8D26A]" />
      <div class="relative flex items-start justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-900/50">Ojaly business report</p><h2 class="mt-2 font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">{{ business?.name || 'Your business' }}</h2><p class="mt-1 text-xs font-semibold text-forest-900/50">{{ period }} · {{ dashboard.data.value?.range?.human || '' }}</p></div><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-[#F4F1E8]"><TrendingUp class="h-5 w-5" /></div></div>
      <div class="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-white/70 p-4"><p class="text-[9px] font-bold uppercase tracking-wider text-forest-900/45">Revenue</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(summary?.revenueKobo) }}</p></div>
        <div class="rounded-2xl bg-forest-900 p-4 text-[#F4F1E8]"><p class="text-[9px] font-bold uppercase tracking-wider opacity-50">Real profit</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(summary?.profitKobo) }}</p></div>
        <div class="rounded-2xl bg-white/70 p-4"><p class="text-[9px] font-bold uppercase tracking-wider text-forest-900/45">Sales</p><p class="mt-1 font-display text-2xl font-bold">{{ summary?.salesCount || 0 }}</p></div>
        <div class="rounded-2xl bg-white/70 p-4"><p class="text-[9px] font-bold uppercase tracking-wider text-forest-900/45">Margin</p><p class="mt-1 font-display text-2xl font-bold">{{ summary?.profitMargin || 0 }}%</p></div>
      </div>
      <div class="relative mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-2xl bg-white/70 p-4"><p class="text-[9px] font-bold uppercase tracking-wider text-forest-900/45">Best seller</p><p v-if="top" class="mt-1 text-sm font-bold">{{ top.name }}</p><p v-else class="mt-1 text-xs text-forest-900/50">No sale recorded this period.</p><p v-if="top" class="mt-1 text-[10px] text-forest-900/50">{{ top.quantity }} sold · {{ formatNaira(top.revenueKobo) }}</p></div>
        <div class="rounded-2xl bg-[#E8D26A] p-4"><p class="text-[9px] font-bold uppercase tracking-wider text-forest-900/45">Money owed</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(dashboard.data.value?.debts?.outstandingKobo) }}</p><p class="mt-1 text-[10px] text-forest-900/60">{{ dashboard.data.value?.debts?.count || 0 }} customers</p></div>
      </div>
      <div class="relative mt-7 flex items-center justify-between border-t border-forest-900/10 pt-3 text-[9px] font-bold uppercase tracking-wider text-forest-900/40"><span>{{ business?.name }} · {{ period }}</span><span>Powered by Ojaly</span></div>
    </div>
    <p class="text-center text-[11px] text-muted">Tip: download the PNG and post it on WhatsApp status every Sunday night. It makes the business look consistent and gives customers a reason to come back.</p>
  </div>
</template>
