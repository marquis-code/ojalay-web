<script setup lang="ts">
import { Check, Clock3, Copy, EyeOff, MessageSquareQuote, Reply, Send, Star, Trash2 } from 'lucide-vue-next';
import { formatDate } from '~/utils/date';
import type { Review } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Reviews' });
const toast = useToast();
const { items, requests, summary, loading, filter, load, setStatus, reply, remove } = useReviews();
const tab = ref<'feedback' | 'requests'>('feedback');
const busy = ref<string | null>(null);
const replyTo = ref<string | null>(null);
const replyDraft = ref('');
const filters = [{ value: 'all', label: 'All reviews' }, { value: 'published', label: 'Published' }, { value: 'pending', label: 'Pending' }, { value: 'hidden', label: 'Hidden' }];
function stars(n: number) { return Array.from({ length: 5 }, (_, i) => i < n); }
async function act(review: Review, status: Review['status']) {
  busy.value = review.id;
  try { await setStatus(review.id, status); toast.success(status === 'published' ? 'Review published.' : 'Review hidden.'); }
  catch (error) { toast.error((error as Error).message); } finally { busy.value = null; }
}
async function removeReview(review: Review) {
  busy.value = review.id;
  try { await remove(review.id); toast.success('Review deleted.'); }
  catch (error) { toast.error((error as Error).message); } finally { busy.value = null; }
}
async function sendReply(review: Review) {
  if (!replyDraft.value.trim()) return;
  busy.value = review.id;
  try { await reply(review.id, replyDraft.value.trim()); toast.success('Reply published with the review.'); replyTo.value = null; replyDraft.value = ''; }
  catch (error) { toast.error((error as Error).message); } finally { busy.value = null; }
}
async function copyLink(url: string | null) {
  if (!url) return;
  try { await navigator.clipboard.writeText(url); toast.success('Review link copied.'); } catch { toast.error('Could not copy the link.'); }
}
watch(filter, load);
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Reviews" subtitle="Collect feedback after every appointment, reply publicly and spot the jobs that need attention." eyebrow="Reputation">
      <template #actions><BaseButton to="/app/bookings" variant="outline">Appointments</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Average rating</p><p class="mt-1 flex items-center gap-1 font-display text-2xl font-bold">{{ summary.average || '—' }} <Star class="h-4 w-4 fill-warning text-warning" /></p><p class="text-[10px] text-muted">{{ summary.total }} published review{{ summary.total === 1 ? '' : 's' }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">5-star reviews</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ summary.fiveStar }}</p><p class="text-[10px] text-muted">{{ summary.needsAttention }} need{{ summary.needsAttention === 1 ? 's' : '' }} attention</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Vendor response rate</p><p class="mt-1 font-display text-2xl font-bold">{{ summary.responseRate }}%</p><p class="text-[10px] text-muted">Reviews with a business reply</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Awaiting feedback</p><p class="mt-1 flex items-center gap-2 font-display text-2xl font-bold">{{ summary.pendingRequests }} <Clock3 class="h-4 w-4 text-warning" /></p><p class="text-[10px] text-muted">Completed appointments</p></div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2"><div class="flex gap-2"><button type="button" class="rounded-full border px-3.5 py-2 text-[11px] font-bold" :class="tab === 'feedback' ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="tab = 'feedback'">Feedback</button><button type="button" class="rounded-full border px-3.5 py-2 text-[11px] font-bold" :class="tab === 'requests' ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="tab = 'requests'">Awaiting feedback <span v-if="summary.pendingRequests" class="ml-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] text-white">{{ summary.pendingRequests }}</span></button></div><div v-if="tab === 'feedback'" class="flex flex-wrap gap-1"><button v-for="f in filters" :key="f.value" type="button" class="rounded-full px-2.5 py-1.5 text-[10px] font-bold" :class="filter === f.value ? 'bg-raised text-ink' : 'text-muted'" @click="filter = f.value">{{ f.label }}</button></div></div>

        <template v-if="tab === 'requests'">
          <div v-if="!requests.length" class="card p-8 text-center"><MessageSquareQuote class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">No feedback requests pending</p><p class="mt-1 text-xs text-muted">When you complete an appointment, the customer gets a review link here.</p></div>
          <article v-for="request in requests" :key="request.id" class="card p-4">
            <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="font-bold">{{ request.customerName }}</p><p class="mt-1 text-xs text-muted">{{ request.serviceName }} · {{ request.bookingNumber }}</p><p class="mt-1 text-[10px] text-muted">Completed {{ formatDate(request.completedAt) }}<span v-if="request.reviewRequestedAt"> · request sent</span><span v-else> · request not sent</span></p></div><BaseButton v-if="request.reviewUrl" size="sm" variant="outline" @click="copyLink(request.reviewUrl)"><Copy class="h-3.5 w-3.5" /> Copy review link</BaseButton></div>
            <p class="mt-2 break-all text-[10px] text-muted">{{ request.reviewUrl }}</p>
          </article>
        </template>

        <template v-else>
          <div v-if="loading" class="space-y-2"><div v-for="i in 3" :key="i" class="skeleton h-32 rounded-2xl" /></div>
          <BaseEmptyState v-else-if="!items.length" title="No reviews yet" message="Complete an appointment and the client will get a private review link. Published feedback appears here."><template #icon><MessageSquareQuote class="h-9 w-9" /></template></BaseEmptyState>
          <article v-for="review in items" :key="review.id" class="card p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><p class="font-bold">{{ review.customerName }}</p><span class="flex gap-0.5"><Star v-for="(filled, i) in stars(review.rating)" :key="i" class="h-3.5 w-3.5" :class="filled ? 'fill-warning text-warning' : 'text-line'" /></span><BaseBadge :variant="review.status === 'published' ? 'success' : review.status === 'hidden' ? 'neutral' : 'warning'">{{ review.status }}</BaseBadge></div><p class="mt-1 text-xs text-muted">{{ review.serviceName }} · {{ review.providerName }} · {{ formatDate(review.createdAt) }}</p><p v-if="review.comment" class="mt-2 max-w-2xl text-sm leading-relaxed">{{ review.comment }}</p><div v-if="review.tags?.length" class="mt-2 flex flex-wrap gap-1"><span v-for="tag in review.tags" :key="tag" class="rounded-full bg-raised px-2 py-1 text-[9px] font-semibold text-muted">{{ tag }}</span></div><div v-if="review.vendorReply" class="mt-3 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800"><strong>Your reply:</strong> {{ review.vendorReply }}</div></div>
              <div class="flex flex-wrap gap-1.5"><BaseButton v-if="review.status !== 'published'" size="sm" variant="outline" :loading="busy === review.id" @click="act(review, 'published')">Publish</BaseButton><BaseButton v-if="review.status !== 'hidden'" size="sm" variant="outline" :loading="busy === review.id" @click="act(review, 'hidden')"><EyeOff class="h-3.5 w-3.5" /> Hide</BaseButton><button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl text-danger hover:bg-danger/5" aria-label="Delete review" @click="removeReview(review)"><Trash2 class="h-3.5 w-3.5" /></button></div>
            </div>
            <div v-if="review.status === 'published'" class="mt-3 border-t border-line pt-3">
              <button v-if="replyTo !== review.id" type="button" class="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600" @click="replyTo = review.id; replyDraft = review.vendorReply || ''"><Reply class="h-3.5 w-3.5" /> {{ review.vendorReply ? 'Edit reply' : 'Reply publicly' }}</button>
              <div v-else class="flex flex-col gap-2"><textarea v-model="replyDraft" rows="2" maxlength="1000" class="input-base min-h-20 text-xs" placeholder="Thank the customer or respond to their feedback…" /><div class="flex gap-2"><BaseButton size="sm" :loading="busy === review.id" @click="sendReply(review)"><Send class="h-3.5 w-3.5" /> Publish reply</BaseButton><BaseButton size="sm" variant="ghost" @click="replyTo = null">Cancel</BaseButton></div></div>
            </div>
          </article>
        </template>
      </div>

      <aside class="space-y-4">
        <BaseCard><h3 class="font-display text-lg font-bold">Rating breakdown</h3><div class="mt-3 space-y-2"><div v-for="row in summary.distribution" :key="row.star" class="flex items-center gap-2 text-[10px]"><span class="w-8">{{ row.star }}★</span><div class="h-1.5 flex-1 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-warning" :style="{ width: `${summary.total ? (row.count / summary.total) * 100 : 0}%` }" /></div><span class="w-5 text-right font-bold">{{ row.count }}</span></div></div></BaseCard>
        <BaseCard v-if="summary.services.length"><h3 class="font-display text-lg font-bold">By service</h3><div class="mt-3 space-y-2"><div v-for="service in summary.services" :key="service.name" class="flex justify-between gap-2 text-[10px]"><span class="truncate text-muted">{{ service.name }}</span><span class="shrink-0 font-bold">{{ service.rating }}★ · {{ service.count }}</span></div></div></BaseCard>
        <BaseCard><h3 class="font-display text-lg font-bold">Category averages</h3><div class="mt-3 space-y-2"><div v-for="(value, key) in summary.categoryAverages" :key="key" class="flex justify-between gap-2 text-[10px]"><span class="capitalize text-muted">{{ key }}</span><span class="font-bold">{{ value ?? '—' }} / 5</span></div></div></BaseCard>
        <BaseCard class="bg-accent/30"><p class="font-display text-lg font-bold">Feedback keeps trust real.</p><p class="mt-1 text-xs leading-relaxed text-muted">Only customers with a completed Ojaly appointment can review. Reply publicly to show future customers how you handle feedback.</p></BaseCard>
      </aside>
    </div>
  </div>
</template>
