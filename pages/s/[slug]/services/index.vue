<script setup lang="ts">
definePageMeta({ layout: false });
import { ArrowRight, Clock3, Scissors } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data } = await useStorefrontServices(slug);
useSeoMeta({
  title: computed(() => data.value ? `Services — ${data.value.business.name}` : 'Services'),
  description: computed(() => data.value?.business.seoDescription || data.value?.business.description || 'Book an appointment.'),
});
</script>

<template>
  <StorefrontShell v-if="data" :business="data.business" :template="data.template">
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: data.template.colors.primary }">The service menu</p><h1 class="mt-2 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl" :style="{ color: data.template.colors.ink }">Choose your appointment.</h1><p class="mt-2 max-w-xl text-sm leading-relaxed" :style="{ color: data.template.colors.muted }">Prices, duration and availability are live. Pick a service, choose a time, and we’ll take it from there.</p></div>
        <NuxtLink to="#services" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 text-sm font-bold" :style="{ background: data.template.colors.primary, color: data.template.colors.onPrimary }">Browse services <ArrowRight class="h-4 w-4" /></NuxtLink>
      </div>
      <div id="services" class="mt-8 space-y-8">
        <div v-for="category in [...new Set(data.items.map((s) => s.category))]" :key="category">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em]" :style="{ color: data.template.colors.muted }">{{ category }}</p>
          <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink v-for="service in data.items.filter((s) => s.category === category)" :key="service.id" :to="`/s/${data.business.slug}/services/${service.id}`" class="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 12%, transparent)`, background: data.template.colors.surface }">
              <div class="flex items-start justify-between gap-3"><div><h2 class="font-display text-xl font-bold" :style="{ color: data.template.colors.ink }">{{ service.name }}</h2><p class="mt-1 text-[10px] font-semibold uppercase tracking-wider" :style="{ color: data.template.colors.muted }">{{ service.durationMinutes }} minutes</p></div><Scissors class="h-5 w-5 opacity-30" :style="{ color: data.template.colors.primary }" /></div>
              <p class="mt-3 line-clamp-2 text-xs leading-relaxed" :style="{ color: data.template.colors.muted }">{{ service.description || 'A considered appointment, made for you.' }}</p>
              <div class="mt-5 flex items-center justify-between"><span class="font-display text-lg font-bold" :style="{ color: data.template.colors.primary }">{{ formatNaira(service.priceKobo) }}</span><span class="inline-flex items-center gap-1 text-[10px] font-bold" :style="{ color: data.template.colors.ink }">Book <ArrowRight class="h-3 w-3 transition group-hover:translate-x-0.5" /></span></div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-if="data.providers.length" class="mt-10 rounded-2xl border p-5" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 12%, transparent)` }"><p class="text-[10px] font-bold uppercase tracking-[0.16em]" :style="{ color: data.template.colors.primary }">The team</p><div class="mt-3 flex flex-wrap gap-3"><div v-for="provider in data.providers" :key="provider.id" class="flex items-center gap-2"><div class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" :style="{ background: provider.color }">{{ provider.name.slice(0, 1) }}</div><div><p class="text-xs font-bold" :style="{ color: data.template.colors.ink }">{{ provider.name }}</p><p class="text-[10px]" :style="{ color: data.template.colors.muted }">{{ provider.title || 'Team member' }}</p></div></div></div></div>
    </section>
  </StorefrontShell>
</template>
