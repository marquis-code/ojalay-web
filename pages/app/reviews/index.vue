<script setup lang="ts">
import { EyeOff, MessageSquareQuote, Star, Trash2 } from 'lucide-vue-next';
import { formatDate } from '~/utils/date';
import type { Review } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Reviews' });

const toast = useToast();
const { items, summary, loading, filter, load, setStatus, remove } = useReviews();
const busy = ref<string | null>(null);
const filters = [
  { value: 'all', label: 'All reviews' }, { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' }, { value: 'hidden', label: 'Hidden' },
];
function stars(rating: number) { return Array.from({ length: 5 }, (_, i) => i < rating); }
async function act(review: Review, status: Review['status']) {
  busy.value = review.id;
  try { await setStatus(review.id, status); toast.success(status === 'published' ? 'Review published.' : 'Review hidden.'); }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = null; }
}
async function removeReview(review: Review) {
  busy.value = review.id;
  try { await remove(review.id); toast.success('Review deleted.'); }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = null; }
}
watch(filter, load);
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Reviews" subtitle="What clients say after the appointment — and the ones that need a human reply." eyebrow="Reputation">
      <template #actions><BaseButton to="/app/bookings" variant="outline">Appointments</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-4">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Average</p><p class="mt-1 flex items-center gap-1 font-display text-2xl font-bold">{{ summary.average || '—' }} <Star class="h-4 w-4 fill-warning text-warning" /></p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Published</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.total }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">5-star</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ summary.fiveStar }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Need attention</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ summary.needsAttention }}</p></div>
    </div>

    <div class="flex flex-wrap gap-2"><button v-for="f in filters" :key="f.value" type="button" class="rounded-full border px-3.5 py-2 text-[11px] font-bold" :class="filter === f.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="filter = f.value">{{ f.label }}</button></div>

    <div v-if="loading" class="space-y-2"><div v-for="i in 3" :key="i" class="skeleton h-32 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No reviews yet" message="When you complete an appointment, the client gets a private review link. Reviews will appear here.">
      <template #icon><MessageSquareQuote class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="space-y-2">
      <article v-for="review in items" :key="review.id" class="card p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2"><p class="font-bold">{{ review.customerName }}</p><span class="flex gap-0.5"><Star v-for="(filled, i) in stars(review.rating)" :key="i" class="h-3.5 w-3.5" :class="filled ? 'fill-warning text-warning' : 'text-line'" /></span><BaseBadge :variant="review.status === 'published' ? 'success' : review.status === 'hidden' ? 'neutral' : 'warning'">{{ review.status }}</BaseBadge></div>
            <p class="mt-1 text-xs text-muted">{{ review.serviceName }} · {{ review.providerName }} · {{ formatDate(review.createdAt) }}</p>
            <p v-if="review.comment" class="mt-2 max-w-2xl text-sm leading-relaxed">{{ review.comment }}</p>
            <p v-else class="mt-2 text-xs text-muted">No written comment.</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <BaseButton v-if="review.status !== 'published'" size="sm" variant="outline" :loading="busy === review.id" @click="act(review, 'published')">Publish</BaseButton>
            <BaseButton v-if="review.status !== 'hidden'" size="sm" variant="outline" :loading="busy === review.id" @click="act(review, 'hidden')"><EyeOff class="h-3.5 w-3.5" /> Hide</BaseButton>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl text-danger hover:bg-danger/5" aria-label="Delete review" @click="removeReview(review)"><Trash2 class="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
