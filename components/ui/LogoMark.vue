<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; wordmark?: boolean; dark?: boolean }>(), { size: 'md', wordmark: true });
const sizes = { sm: 'h-8 w-8 rounded-[10px]', md: 'h-10 w-10 rounded-xl', lg: 'h-12 w-12 rounded-2xl' };
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span class="relative inline-flex shrink-0 overflow-hidden" :class="sizes[size]">
      <img src="/brand/ojaly-mark.svg" alt="" class="h-full w-full" width="64" height="64">
    </span>
    <span v-if="wordmark" class="font-display font-bold tracking-[-0.045em]" :class="[dark ? 'text-white' : 'text-ink', size === 'lg' ? 'text-2xl' : 'text-xl']">ojaly<span class="text-brand-500">.</span></span>
  </span>
</template>
