<script setup lang="ts">
import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles, Star } from 'lucide-vue-next';
import type { PublicProvider, Service, StorefrontBusiness, StorefrontTemplate } from '~/types';
import { formatNaira } from '~/utils/money';
const props = defineProps<{ business: StorefrontBusiness; template: StorefrontTemplate; services: Service[]; providers: PublicProvider[] }>();
const { openChat } = useStorefrontChat();
</script>

<template>
  <div>
    <section class="relative overflow-hidden" :style="{ background: template.colors.background, color: template.colors.ink }">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <p class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" :style="{ background: template.colors.accent, color: template.colors.ink }"><Sparkles class="h-3 w-3" /> {{ business.campusVerified ? 'Verified local business' : 'Appointments open' }}</p>
          <h1 class="mt-5 max-w-xl font-display text-[clamp(2.8rem,6vw,5.2rem)] font-bold leading-[0.93] tracking-[-0.055em]">{{ business.serviceHeroTitle || 'Book your next appointment.' }}</h1>
          <p class="mt-4 max-w-lg text-sm leading-relaxed sm:text-base" :style="{ color: template.colors.muted }">{{ business.description || business.tagline }}</p>
          <div class="mt-6 flex flex-wrap gap-2 text-[10px] font-semibold" :style="{ color: template.colors.muted }">
            <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-2" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 16%, transparent)` }"><CalendarDays class="h-3.5 w-3.5" /> Live availability</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-2" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 16%, transparent)` }"><Star class="h-3.5 w-3.5" /> {{ services.length }} services</span>
            <span v-if="business.address" class="inline-flex items-center gap-1.5 rounded-full border px-3 py-2" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 16%, transparent)` }"><MapPin class="h-3.5 w-3.5" /> {{ business.address }}</span>
          </div>
          <div class="mt-7 flex flex-col gap-2 sm:flex-row">
            <NuxtLink :to="`/s/${business.slug}/services`" class="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">See services & book <ArrowRight class="h-4 w-4" /></NuxtLink>
            <button type="button" class="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border-2 px-6 text-sm font-bold" :style="{ borderColor: template.colors.ink, color: template.colors.ink }" @click="openChat({ type: 'general' })">Ask a question</button>
          </div>
        </div>
        <div class="relative">
          <div class="overflow-hidden rounded-[2rem]" :style="{ background: template.colors.surface }">
            <video v-if="business.heroVideoUrl" :src="business.heroVideoUrl" :poster="business.bannerUrl || business.storyImageUrl || undefined" class="aspect-[4/3] w-full object-cover" autoplay muted loop playsinline preload="metadata"></video>
            <img v-else-if="business.bannerUrl || business.storyImageUrl" :src="business.bannerUrl || business.storyImageUrl || ''" :alt="business.name" class="aspect-[4/3] w-full object-cover">
            <div v-else class="flex aspect-[4/3] items-center justify-center p-8 text-center" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 14%, ${template.colors.background})` }"><div><p class="font-display text-4xl font-bold">{{ business.name }}</p><p class="mt-2 text-[10px] font-bold uppercase tracking-[0.2em]" :style="{ color: template.colors.primary }">Book direct · No marketplace fee</p></div></div>
          </div>
          <div class="absolute -bottom-4 left-4 rounded-2xl border px-4 py-3 shadow-xl" :style="{ background: template.colors.background, borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)` }">
            <p class="text-[9px] font-bold uppercase tracking-[0.16em]" :style="{ color: template.colors.primary }">Next available</p>
            <p class="mt-0.5 text-sm font-bold">Choose a service to see times</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="flex items-end justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The menu</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">Choose your service</h2></div><NuxtLink :to="`/s/${business.slug}/services`" class="text-xs font-bold" :style="{ color: template.colors.primary }">View full menu →</NuxtLink></div>
      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="service in services" :key="service.id" :to="`/s/${business.slug}/services/${service.id}`" class="group flex flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface }">
          <div class="flex items-start justify-between gap-2"><p class="text-[9px] font-bold uppercase tracking-[0.14em]" :style="{ color: template.colors.muted }">{{ service.category }}</p><PlatformPromoBadge /></div>
          <div class="mt-1 flex items-start justify-between gap-2"><p class="font-display text-lg font-bold leading-tight" :style="{ color: template.colors.ink }">{{ service.name }}</p><p class="shrink-0 text-sm font-bold" :style="{ color: template.colors.primary }">{{ formatNaira(service.priceKobo) }}</p></div>
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed" :style="{ color: template.colors.muted }">{{ service.description || 'A considered appointment, made for you.' }}</p>
          <div class="mt-auto flex items-center justify-between gap-2 pt-4"><span class="inline-flex items-center gap-1 text-[10px] font-semibold" :style="{ color: template.colors.muted }"><Clock3 class="h-3 w-3" /> {{ service.durationMinutes }} min</span><span class="inline-flex items-center gap-1 text-[10px] font-bold" :style="{ color: template.colors.primary }">Book <ArrowRight class="h-3 w-3 transition group-hover:translate-x-0.5" /></span></div>
        </NuxtLink>
      </div>
    </section>

    <section v-if="providers.length" class="border-y" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)`, background: template.colors.surface }">
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">The team</p>
        <h2 class="mt-1 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">Choose who you see.</h2>
        <div class="mt-5 flex flex-wrap gap-3">
          <div v-for="provider in providers" :key="provider.id" class="flex items-center gap-3 rounded-2xl border px-3 py-2.5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)` }">
            <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white" :style="{ background: provider.color }"><img v-if="provider.avatarUrl" :src="provider.avatarUrl" :alt="provider.name" class="h-full w-full object-cover"><span v-else>{{ provider.name.slice(0, 1) }}</span></div>
            <div><p class="text-xs font-bold" :style="{ color: template.colors.ink }">{{ provider.name }}</p><p class="text-[10px]" :style="{ color: template.colors.muted }">{{ provider.title || 'Team member' }}</p></div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="business.bookingSettings?.policy" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="rounded-2xl border p-4 text-xs leading-relaxed" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, color: template.colors.muted }"><strong :style="{ color: template.colors.ink }">Booking policy.</strong> {{ business.bookingSettings.policy }}</div>
    </section>
  </div>
</template>
