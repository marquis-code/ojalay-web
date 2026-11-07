<script setup lang="ts">
import { Check, ChevronDown, Search } from 'lucide-vue-next';
interface SelectOption { value: string; label: string }
const props = withDefaults(defineProps<{
  modelValue: string;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
}>(), { placeholder: 'Search…' });
const emit = defineEmits<{ 'update:modelValue': [string] }>();
const open = ref(false);
const query = ref('');
const root = ref<HTMLElement | null>(null);
const selected = computed(() => props.options.find((option) => option.value === props.modelValue));
const filtered = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) return props.options;
  return props.options.filter((option) => option.label.toLowerCase().includes(term));
});
function choose(option: SelectOption) { emit('update:modelValue', option.value); open.value = false; query.value = ''; }
function toggle() { if (props.disabled) return; open.value = !open.value; if (open.value) nextTick(() => (root.value?.querySelector('input[type="search"]') as HTMLInputElement | null)?.focus()); }
function outside(event: MouseEvent) { if (root.value && !root.value.contains(event.target as Node)) open.value = false; }
onMounted(() => document.addEventListener('mousedown', outside));
onBeforeUnmount(() => document.removeEventListener('mousedown', outside));
</script>

<template>
  <div ref="root" class="relative">
    <label v-if="label" class="label-base">{{ label }}</label>
    <button type="button" class="input-base flex min-h-[46px] items-center justify-between gap-2 text-left" :class="disabled ? 'cursor-not-allowed opacity-60' : ''" :disabled="disabled" :aria-expanded="open" aria-haspopup="listbox" @click="toggle">
      <span class="truncate" :class="selected ? 'text-ink' : 'text-muted/70'">{{ selected?.label || placeholder }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 text-muted transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <div v-if="open" class="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
      <div class="border-b border-line p-2"><div class="relative"><Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" /><input v-model="query" type="search" class="input-base min-h-[38px] !py-1.5 pl-8 text-xs" :placeholder="`Search ${label?.toLowerCase() || 'options'}…`" aria-label="Search options"></div></div>
      <div class="max-h-64 overflow-y-auto p-1" role="listbox">
        <button v-for="option in filtered" :key="option.value" type="button" role="option" :aria-selected="option.value === modelValue" class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-raised" :class="option.value === modelValue ? 'font-bold text-brand-600' : 'text-ink'" @click="choose(option)"><span class="truncate">{{ option.label }}</span><Check v-if="option.value === modelValue" class="h-3.5 w-3.5 shrink-0" /></button>
        <p v-if="!filtered.length" class="px-3 py-5 text-center text-xs text-muted">No match. Try another name.</p>
      </div>
    </div>
    <p v-if="hint" class="mt-1.5 text-[10px] leading-relaxed text-muted">{{ hint }}</p>
  </div>
</template>
