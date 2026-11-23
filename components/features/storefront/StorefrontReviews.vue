<script setup lang="ts">
import { Quote, Star } from 'lucide-vue-next';
import type { PublicReview, StorefrontTemplate } from '~/types';
const props = defineProps<{ reviews: { items: PublicReview[]; average: number; count: number }; template: StorefrontTemplate }>();
const filled = (rating: number) => Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
</script>

<template>
  <section v-if="reviews.count" class="border-t" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)`, background: template.colors.surface }">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Client love</p>
          <div class="mt-1 flex items-end gap-3"><h2 class="font-display text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: template.colors.ink }">{{ reviews.average }} out of 5</h2><div class="mb-1 flex gap-0.5"><Star v-for="(on, i) in filled(reviews.average)" :key="i" class="h-4 w-4" :class="on ? 'fill-warning text-warning' : 'text-line'" /></div></div>
          <p class="mt-1 text-xs" :style="{ color: template.colors.muted }">Based on {{ reviews.count }} verified appointment{{ reviews.count === 1 ? '' : 's' }}.</p>
        </div>
        <p class="max-w-xs text-[10px] leading-relaxed" :style="{ color: template.colors.muted }">Every review is linked to a completed Ojaly appointment.</p>
      </div>
      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="review in reviews.items.slice(0, 6)" :key="review.id" class="rounded-2xl border p-4" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 10%, transparent)`, background: template.colors.background }">
          <Quote class="h-4 w-4" :style="{ color: template.colors.primary }" />
          <div class="mt-2 flex gap-0.5"><Star v-for="(on, i) in filled(review.rating)" :key="i" class="h-3.5 w-3.5" :class="on ? 'fill-warning text-warning' : 'text-line'" /></div>
          <p v-if="review.comment" class="mt-2 text-xs leading-relaxed" :style="{ color: template.colors.ink }">{{ review.comment }}</p>
          <p class="mt-3 text-[10px] font-bold" :style="{ color: template.colors.ink }">{{ review.customerName }}</p>
          <p class="text-[9px]" :style="{ color: template.colors.muted }">{{ review.serviceName }}</p>
          <p v-if="review.vendorReply" class="mt-2 rounded-lg p-2 text-[10px] leading-relaxed" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 8%, transparent)`, color: template.colors.muted }"><strong :style="{ color: template.colors.ink }">Business reply:</strong> {{ review.vendorReply }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
