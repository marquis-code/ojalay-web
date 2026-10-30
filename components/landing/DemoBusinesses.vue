<script setup lang="ts">
import { ArrowRight, BadgeCheck, Store } from 'lucide-vue-next';
import { publicApi } from '~/api/factories/publicApi';
import { formatNaira } from '~/utils/money';
import type { DemoBusiness } from '~/types';
const items = ref<DemoBusiness[]>([]);
onMounted(async () => {
  try { items.value = await publicApi.demoBusinesses(); } catch { items.value = []; }
});
</script>

<template>
  <section v-if="items.length" class="border-b border-line bg-canvas py-14 sm:py-20">
    <div class="shell">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">Live demo storefronts</p>
          <h2 class="mt-2 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">See both sides of Ojaly.</h2>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-muted">Real seeded businesses. Shop a product storefront or book a service, then log in as the owner to see the other side.</p>
        </div>
        <NuxtLink to="/marketplace" class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600">Explore the marketplace <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
      </div>
      <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="business in items" :key="business.id" class="group overflow-hidden rounded-3xl border border-line bg-surface">
          <div class="relative h-32 overflow-hidden bg-forest-900">
            <img v-if="business.bannerUrl || business.logoUrl" :src="business.bannerUrl || business.logoUrl || ''" :alt="business.name" class="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105">
            <div v-else class="flex h-full items-center justify-center"><Store class="h-8 w-8 text-white/25" /></div>
            <span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-forest-900"><BadgeCheck class="h-3 w-3 text-success" /> Demo</span>
            <span class="absolute right-3 top-3 rounded-full bg-forest-900/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{{ business.mode === 'services' ? 'Services' : 'Products' }}</span>
          </div>
          <div class="p-4">
            <h3 class="font-display text-lg font-bold leading-tight">{{ business.name }}</h3>
            <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{{ business.tagline || 'A verified local business on Ojaly.' }}</p>
            <div class="mt-3 flex items-center justify-between gap-2"><p class="text-[10px] font-semibold text-muted">{{ business.campusCode }} · {{ business.serviceCount || business.productCount }} {{ business.mode === 'services' ? 'services' : 'products' }}</p><p v-if="business.startingPriceKobo" class="text-[10px] font-bold text-brand-600">from {{ formatNaira(business.startingPriceKobo) }}</p></div>
            <NuxtLink :to="business.href" class="mt-3 flex min-h-[38px] items-center justify-center gap-1 rounded-xl bg-ink text-[11px] font-bold text-canvas">{{ business.cta }} <ArrowRight class="h-3 w-3" /></NuxtLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
