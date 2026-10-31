<script setup lang="ts">
import { ChevronDown, Clock3, X } from 'lucide-vue-next';
import { useId } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  step?: number;
  minTime?: string;
  maxTime?: string;
}>(), {
  placeholder: 'Select time',
  clearable: true,
  step: 30,
});

const emit = defineEmits<{ 'update:modelValue': [string]; change: [string] }>();
const id = useId();
const trigger = ref<HTMLButtonElement | null>(null);
const open = ref(false);
const menuStyle = ref<Record<string, string>>({});
const placement = ref<'bottom' | 'top'>('bottom');
const isMobile = ref(false);

function parseTime(value?: string | null) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '');
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}
function toValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
function display(value?: string | null) {
  const parsed = parseTime(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(2026, 0, 1, parsed.hour, parsed.minute));
}
const displayValue = computed(() => display(props.modelValue) || props.placeholder);
const options = computed(() => {
  const step = Math.max(5, props.step || 30);
  const values: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const value = toValue(Math.floor(minutes / 60), minutes % 60);
    if (props.minTime && value < props.minTime) continue;
    if (props.maxTime && value > props.maxTime) continue;
    values.push(value);
  }
  return values;
});
const presets = computed(() => [
  { label: 'Morning', value: '09:00' },
  { label: 'Noon', value: '12:00' },
  { label: 'Afternoon', value: '15:00' },
  { label: 'Evening', value: '18:00' },
].filter((preset) => options.value.includes(preset.value)));

function updatePosition() {
  if (typeof window === 'undefined') return;
  isMobile.value = window.innerWidth < 640;
  if (isMobile.value || !trigger.value) { menuStyle.value = {}; return; }
  const rect = trigger.value.getBoundingClientRect();
  const width = Math.min(312, window.innerWidth - 24);
  const height = 380;
  const place = window.innerHeight - rect.bottom < height + 12 && rect.top > window.innerHeight - rect.bottom ? 'top' : 'bottom';
  placement.value = place;
  const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
  menuStyle.value = {
    position: 'fixed', left: `${left}px`, width: `${width}px`, zIndex: '150',
    ...(place === 'top' ? { bottom: `${window.innerHeight - rect.top + 6}px` } : { top: `${rect.bottom + 6}px` }),
  };
}
function close(restore = true) {
  if (!open.value) return;
  open.value = false;
  document.removeEventListener('pointerdown', onPointerDown, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
  if (restore) trigger.value?.focus();
}
async function openMenu() {
  if (props.disabled || open.value) return;
  open.value = true;
  isMobile.value = window.innerWidth < 640;
  await nextTick(); updatePosition();
  document.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
}
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (trigger.value?.contains(target) || document.getElementById(`${id}-time`)?.contains(target)) return;
  close(false);
}
function select(value: string) {
  emit('update:modelValue', value);
  emit('change', value);
  close();
}
function clear(event?: Event) {
  event?.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
  close();
}
function triggerKeys(event: KeyboardEvent) {
  if (['Enter', ' ', 'ArrowDown'].includes(event.key)) { event.preventDefault(); void openMenu(); }
  else if (event.key === 'Escape') close();
}
onBeforeUnmount(() => close(false));
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label-base">{{ label }} <span v-if="required" class="text-brand-500">*</span></label>
    <div class="relative w-full">
      <button :id="id" ref="trigger" type="button" :disabled="disabled" :aria-label="ariaLabel || label || placeholder" :aria-expanded="open" aria-haspopup="dialog" :aria-required="required || undefined" class="group flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 text-left text-ink transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50" :class="[modelValue ? 'font-medium' : 'text-muted/70', error ? 'border-danger focus:border-danger focus:ring-danger/20' : '', open ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-sm' : 'hover:border-ink/20']" style="min-height: 48px" @click="open ? close() : openMenu()" @keydown="triggerKeys">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300"><Clock3 class="h-4 w-4" /></div>
        <span class="min-w-0 flex-1 truncate text-xs sm:text-sm">{{ displayValue }}</span>
        <ChevronDown class="h-4 w-4 shrink-0 text-muted transition-transform duration-200" :class="open ? 'rotate-180 text-brand-500' : 'group-hover:text-ink'" />
      </button>
    </div>
    <p v-if="error" class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>

    <Teleport to="body">
      <Transition :name="isMobile ? 'time-sheet' : 'time-pop'">
        <div v-if="open" :id="`${id}-time`" :style="isMobile ? undefined : menuStyle" role="dialog" aria-modal="true" :aria-label="`${label || 'Choose time'} picker`" class="border border-line bg-surface shadow-2xl" :class="isMobile ? 'fixed inset-x-0 bottom-0 z-[150] rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto' : 'overflow-hidden rounded-3xl p-3.5'">
          <div v-if="isMobile" class="mb-3 flex items-center justify-between"><span class="font-display text-sm font-bold">{{ label || 'Select time' }}</span><button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-raised text-muted" @click="close()"><X class="h-4 w-4" /></button></div>
          <div v-if="presets.length" class="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            <button v-for="preset in presets" :key="preset.value" type="button" class="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition" :class="modelValue === preset.value ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-muted hover:bg-raised hover:text-ink'" @click="select(preset.value)">{{ preset.label }}</button>
          </div>
          <div class="grid max-h-[260px] grid-cols-4 gap-1.5 overflow-y-auto pr-1">
            <button v-for="value in options" :key="value" type="button" class="flex h-10 items-center justify-center rounded-xl text-xs font-semibold transition" :class="modelValue === value ? 'bg-brand-500 text-white shadow-sm' : 'text-ink hover:bg-raised'" :aria-pressed="modelValue === value" @click="select(value)">{{ display(value) }}</button>
          </div>
          <div class="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5"><button v-if="clearable && modelValue" type="button" class="rounded-xl px-2.5 py-1.5 text-xs font-bold text-muted hover:bg-raised" @click="clear">Clear</button><span v-else class="text-[10px] text-muted">30-minute intervals</span><button type="button" class="rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-canvas" @click="close()">Done</button></div>
        </div>
      </Transition>
      <Transition name="fade"><div v-if="open && isMobile" class="fixed inset-0 z-[140] bg-black/50 backdrop-blur-xs" @click="close(false)" /></Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.time-pop-enter-active, .time-pop-leave-active { transition: opacity .16s cubic-bezier(.16,1,.3,1), transform .16s cubic-bezier(.16,1,.3,1); }
.time-pop-enter-from, .time-pop-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
.time-sheet-enter-active, .time-sheet-leave-active { transition: transform .22s cubic-bezier(.16,1,.3,1), opacity .22s ease; }
.time-sheet-enter-from, .time-sheet-leave-to { transform: translateY(100%); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
