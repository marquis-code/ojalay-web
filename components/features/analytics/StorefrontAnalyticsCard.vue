<script setup lang="ts">
import { ArrowUpRight, Eye, MousePointerClick, RefreshCw, TrendingDown, TrendingUp, Users } from 'lucide-vue-next';
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const { data, loading, error, range, load } = useStorefrontAnalytics('30d');
const maxDaily = computed(() => Math.max(1, ...(data.value?.daily || []).map((day) => Math.max(day.visitors, day.visits))));
const change = computed(() => data.value?.comparison.visitorsPercent ?? null);
const rangeOptions = [{ key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: '90d', label: '90 days' }] as const;
const label = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const pathLabel = (value: string) => value.replace(/^\/s\/[^/]+/, '') || '/';
onMounted(() => { void load(); });
</script>

<template>
  <BaseCard v-if="!error || data" :id="compact ? undefined : 'website-analytics'" class="overflow-hidden" :padding="compact ? 'sm' : 'md'">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600"><Eye class="h-4 w-4" /></span><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Storefront traffic</p></div>
        <h2 class="mt-2 font-display text-xl font-bold">Website visitors</h2>
        <p class="mt-0.5 text-[11px] text-muted">People who opened your Ojaly storefront — whether they booked or not.</p>
      </div>
      <div class="flex items-center gap-1">
        <button v-for="option in (compact ? [] : rangeOptions)" :key="option.key" type="button" class="rounded-lg border px-2 py-1 text-[9px] font-bold" :class="range === option.key ? 'border-ink bg-ink text-canvas' : 'border-line text-muted hover:text-ink'" @click="load(option.key)">{{ option.label }}</button>
        <button type="button" class="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted hover:text-ink" aria-label="Refresh website traffic" @click="load(range)"><RefreshCw class="h-3 w-3" :class="loading ? 'animate-spin' : ''" /></button>
      </div>
    </div>

    <div v-if="loading && !data" class="mt-4 grid grid-cols-3 gap-2"><div v-for="i in 3" :key="i" class="skeleton h-20 rounded-xl" /></div>
    <template v-else-if="data">
      <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div class="rounded-xl bg-forest-900 p-3 text-white"><div class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/60"><Users class="h-3 w-3" /> Unique visitors</div><p class="mt-1 font-display text-2xl font-bold">{{ data.totals.visitors.toLocaleString() }}</p><p v-if="change !== null" class="mt-0.5 flex items-center gap-1 text-[9px] font-bold" :class="change >= 0 ? 'text-brand-300' : 'text-warning'"><TrendingUp v-if="change >= 0" class="h-3 w-3" /><TrendingDown v-else class="h-3 w-3" />{{ change >= 0 ? '+' : '' }}{{ change }}% vs previous</p></div>
        <div class="rounded-xl border border-line bg-surface p-3"><div class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted"><MousePointerClick class="h-3 w-3" /> Page visits</div><p class="mt-1 font-display text-2xl font-bold">{{ data.totals.visits.toLocaleString() }}</p><p class="mt-0.5 text-[9px] text-muted">{{ data.range.days === 1 ? 'Today' : `Last ${data.range.days} days` }}</p></div>
        <div class="rounded-xl border border-line bg-surface p-3"><div class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted"><Eye class="h-3 w-3" /> Today</div><p class="mt-1 font-display text-2xl font-bold">{{ data.totals.todayVisitors.toLocaleString() }}</p><p class="mt-0.5 text-[9px] text-muted">{{ data.totals.todayVisits }} page visit{{ data.totals.todayVisits === 1 ? '' : 's' }}</p></div>
      </div>

      <div class="mt-4 flex h-16 items-end gap-1" :aria-label="`Daily storefront traffic for the last ${data.range.days} days`">
        <div v-for="day in data.daily" :key="day.date" class="group relative flex min-w-0 flex-1 flex-col justify-end gap-0.5" :title="`${day.label}: ${day.visitors} visitor${day.visitors === 1 ? '' : 's'}, ${day.visits} visit${day.visits === 1 ? '' : 's'}`">
          <div class="w-full rounded-t bg-brand-500/80 transition group-hover:bg-brand-500" :style="{ height: `${Math.max(2, (day.visitors / maxDaily) * 56)}px` }" />
          <div v-if="day.visits > day.visitors" class="w-full rounded-b bg-forest-900/25" :style="{ height: `${Math.max(1, ((day.visits - day.visitors) / maxDaily) * 56)}px` }" />
        </div>
      </div>
      <div class="mt-1 flex justify-between text-[8px] text-muted"><span>{{ data.daily[0]?.label }}</span><span>{{ data.daily[data.daily.length - 1]?.label }}</span></div>

      <template v-if="!compact">
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Where they came from</p><div v-if="data.sources.length" class="mt-2 space-y-1.5"><div v-for="source in data.sources" :key="source.key" class="flex items-center gap-2 text-[10px]"><span class="w-20 truncate font-semibold">{{ label(source.key) }}</span><div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-brand-500" :style="{ width: `${Math.max(4, (source.visits / Math.max(1, data.totals.visits)) * 100)}%` }" /></div><span class="w-8 text-right font-bold">{{ source.visitors }}</span></div></div><p v-else class="mt-2 text-[10px] text-muted">No source data yet.</p></div>
          <div><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Most visited pages</p><div v-if="data.pages.length" class="mt-2 space-y-1.5"><div v-for="page in data.pages" :key="page.key" class="flex items-center justify-between gap-2 text-[10px]"><span class="truncate text-muted">{{ pathLabel(page.key) }}</span><span class="shrink-0 font-bold">{{ page.visitors }} <span class="font-normal text-muted">visitor{{ page.visitors === 1 ? '' : 's' }}</span></span></div></div><p v-else class="mt-2 text-[10px] text-muted">No page data yet.</p></div>
        </div>
      </template>

      <div class="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <p class="text-[9px] text-muted">Unique visitors are counted per device. Bots and link-preview crawlers are excluded.</p>
        <NuxtLink v-if="compact" to="/app/website#website-analytics" class="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-brand-600">See details <ArrowUpRight class="h-3 w-3" /></NuxtLink>
      </div>
      <p v-if="error" class="mt-2 text-[10px] text-danger">{{ error }}</p>
    </template>
  </BaseCard>
</template>
