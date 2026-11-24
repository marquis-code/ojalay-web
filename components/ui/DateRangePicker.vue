<script setup lang="ts">
import { CalendarDays, ChevronDown, X } from 'lucide-vue-next';
const props = withDefaults(defineProps<{ from?: string; to?: string; placeholder?: string }>(), { from: '', to: '', placeholder: 'All dates' });
const emit = defineEmits<{ apply: [payload: { from: string; to: string }]; clear: [] }>();
const open = ref(false);
const draftFrom = ref(props.from || '');
const draftTo = ref(props.to || '');
const label = computed(() => {
  if (!props.from && !props.to) return props.placeholder;
  const format = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  if (props.from && props.to) return `${format(props.from)} – ${format(props.to)}`;
  if (props.from) return `From ${format(props.from)}`;
  return `Until ${format(props.to)}`;
});
const presets = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: 'month', label: 'This month' },
  { key: 'next30', label: 'Next 30 days' },
];
function dayKey(date: Date) { return date.toISOString().slice(0, 10); }
function choosePreset(key: string) {
  const now = new Date();
  if (key === 'today') { draftFrom.value = dayKey(now); draftTo.value = dayKey(now); }
  if (key === '7d') { const start = new Date(now); start.setDate(start.getDate() - 6); draftFrom.value = dayKey(start); draftTo.value = dayKey(now); }
  if (key === 'month') { draftFrom.value = dayKey(new Date(now.getFullYear(), now.getMonth(), 1)); draftTo.value = dayKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)); }
  if (key === 'next30') { const end = new Date(now); end.setDate(end.getDate() + 30); draftFrom.value = dayKey(now); draftTo.value = dayKey(end); }
}
function openPicker() { draftFrom.value = props.from || ''; draftTo.value = props.to || ''; open.value = true; }
function apply() { emit('apply', { from: draftFrom.value, to: draftTo.value }); open.value = false; }
function clear() { draftFrom.value = ''; draftTo.value = ''; emit('clear'); open.value = false; }
</script>

<template>
  <div class="relative">
    <button type="button" class="flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-left text-[11px] font-bold text-ink hover:border-ink" @click="openPicker">
      <CalendarDays class="h-4 w-4 shrink-0 text-muted" /><span class="min-w-0 flex-1 truncate">{{ label }}</span><ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted" />
    </button>
    <div v-if="open" class="fixed inset-0 z-30" @click="open = false" />
    <div v-if="open" class="absolute right-0 top-full z-40 mt-2 w-[min(380px,calc(100vw-32px))] rounded-2xl border border-line bg-surface p-4 shadow-lift">
      <div class="flex items-center justify-between"><p class="text-sm font-bold">Custom date range</p><button type="button" class="text-muted" aria-label="Close date range" @click="open = false"><X class="h-4 w-4" /></button></div>
      <div class="mt-3 flex flex-wrap gap-1"><button v-for="preset in presets" :key="preset.key" type="button" class="rounded-full bg-raised px-2.5 py-1.5 text-[10px] font-bold text-muted hover:text-ink" @click="choosePreset(preset.key)">{{ preset.label }}</button></div>
      <div class="mt-4 grid grid-cols-2 gap-2">
        <label class="block"><span class="mb-1 block text-[9px] font-bold uppercase tracking-wider text-muted">Start</span><input v-model="draftFrom" type="date" class="input-base h-10 min-h-0 text-xs" aria-label="Start date"></label>
        <label class="block"><span class="mb-1 block text-[9px] font-bold uppercase tracking-wider text-muted">End</span><input v-model="draftTo" type="date" class="input-base h-10 min-h-0 text-xs" aria-label="End date"></label>
      </div>
      <p class="mt-2 text-[10px] text-muted">Both start and end dates are included.</p>
      <div class="mt-4 flex justify-between gap-2"><button type="button" class="text-[11px] font-bold text-muted underline" @click="clear">Clear dates</button><button type="button" class="rounded-xl bg-ink px-4 py-2 text-[11px] font-bold text-canvas" @click="apply">Apply range</button></div>
    </div>
  </div>
</template>
