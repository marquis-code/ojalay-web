<script setup lang="ts">
definePageMeta({ layout: false });
import { ArrowLeft, Clock3, ShieldCheck, Sparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { data } = await useStorefrontService(slug, id);
useSeoMeta({
  title: computed(() => data.value ? `${data.value.service.name} — ${data.value.business.name}` : 'Book a service'),
  description: computed(() => data.value?.service.description || data.value?.business.description || 'Book an appointment.'),
});

useHead(() => data.value ? {
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Service',
      name: data.value.service.name, description: data.value.service.description,
      provider: { '@type': 'LocalBusiness', name: data.value.business.name, address: data.value.business.address },
      offers: { '@type': 'Offer', price: data.value.service.priceKobo / 100, priceCurrency: 'NGN' },
      ...(data.value.service.imageUrl ? { image: data.value.service.imageUrl } : {}),
    }),
  }],
} : {})
</script>

<template>
  <StorefrontShell v-if="data" :business="data.business" :template="data.template">
    <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <NuxtLink :to="`/s/${data.business.slug}/services`" class="inline-flex items-center gap-1.5 text-xs font-semibold" :style="{ color: data.template.colors.muted }"><ArrowLeft class="h-4 w-4" /> All services</NuxtLink>
      <div class="mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: data.template.colors.primary }">{{ data.service.category }}</p>
          <h1 class="mt-2 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl" :style="{ color: data.template.colors.ink }">{{ data.service.name }}</h1>
          <p class="mt-4 max-w-xl text-sm leading-relaxed sm:text-base" :style="{ color: data.template.colors.muted }">{{ data.service.description || 'A considered appointment, made for you.' }}</p>
          <div class="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold" :style="{ color: data.template.colors.muted }"><span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-2" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 16%, transparent)` }"><Clock3 class="h-3.5 w-3.5" /> {{ data.service.durationMinutes }} minutes</span><span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-2" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 16%, transparent)` }"><Sparkles class="h-3.5 w-3.5" /> {{ formatNaira(data.service.priceKobo) }}</span><span v-if="data.service.requiresDeposit" class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-2 text-warning"><ShieldCheck class="h-3.5 w-3.5" /> Deposit {{ formatNaira(data.service.depositKobo) }}</span></div>
          <div v-if="data.service.addOns.length" class="mt-8"><p class="text-[10px] font-bold uppercase tracking-[0.16em]" :style="{ color: data.template.colors.primary }">Make it yours</p><div class="mt-3 grid gap-2 sm:grid-cols-2"><div v-for="addon in data.service.addOns" :key="addon.name" class="flex items-center justify-between rounded-xl border p-3" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 12%, transparent)` }"><div><p class="text-xs font-bold" :style="{ color: data.template.colors.ink }">{{ addon.name }}</p><p v-if="addon.durationMinutes" class="text-[10px]" :style="{ color: data.template.colors.muted }">+{{ addon.durationMinutes }} min</p></div><span class="text-xs font-bold" :style="{ color: data.template.colors.primary }">+{{ formatNaira(addon.priceKobo) }}</span></div></div></div>
          <div v-if="data.business.bookingSettings?.policy" class="mt-8 rounded-2xl border p-4 text-xs leading-relaxed" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 12%, transparent)`, color: data.template.colors.muted }"><strong :style="{ color: data.template.colors.ink }">Before you book.</strong> {{ data.business.bookingSettings.policy }}</div>
        </div>
        <div class="lg:sticky lg:top-24"><ClientOnly><ServiceBookingWidget :business="data.business" :template="data.template" :service="data.service" :providers="data.providers" /></ClientOnly></div>
      </div>
    </section>
  </StorefrontShell>
</template>
