<script setup lang="ts">
import { Check, Star } from 'lucide-vue-next';
definePageMeta({ layout: false });
useCustomerTheme();
useSeoMeta({ title: 'Leave a review', robots: 'noindex,nofollow' });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error, refresh } = await usePublicReview(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Review link not found', fatal: true });
const { busy, error: submitError, submit } = useReviewActions(token);
const rating = ref(5);
const comment = ref('');
const categoryRatings = reactive({ quality: 5, punctuality: 5, communication: 5, value: 5 });
const tags = ref<string[]>([]);
const wouldRecommend = ref(true);
const tagOptions = ['On time', 'Professional', 'Great value', 'Clean work', 'Friendly', 'Would book again'];
const categoryLabels: Record<string, string> = { quality: 'Quality of service', punctuality: 'Punctuality', communication: 'Communication', value: 'Value for money' };
function toggleTag(tag: string) { tags.value = tags.value.includes(tag) ? tags.value.filter((t) => t !== tag) : [...tags.value, tag].slice(0, 6); }
const submitted = ref(false);
const booking = computed(() => data.value!.booking);
const business = computed(() => data.value!.business);
async function save() {
  try { await submit({ rating: rating.value, comment: comment.value, categoryRatings, tags: tags.value, wouldRecommend: wouldRecommend.value }); submitted.value = true; await refresh(); }
  catch { /* error shown */ }
}
function stars(n: number) { return Array.from({ length: 5 }, (_, i) => i < n); }
</script>

<template>
  <div class="min-h-dvh bg-canvas px-4 py-10 text-ink">
    <div class="mx-auto max-w-lg">
      <NuxtLink to="/" class="inline-flex items-center gap-2"><LogoMark /></NuxtLink>
      <div v-if="submitted || data?.review" class="mt-8 rounded-[2rem] border border-line bg-surface p-7 text-center shadow-lift">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success"><Check class="h-7 w-7" /></div>
        <h1 class="mt-4 font-display text-3xl font-bold">Thank you.</h1>
        <p class="mt-2 text-sm text-muted">Your review helps {{ business?.name }} improve and helps the next client choose with confidence.</p>
        <div class="mt-4 flex justify-center gap-1"><Star v-for="(filled, i) in stars(data?.review?.rating || rating)" :key="i" class="h-5 w-5" :class="filled ? 'fill-warning text-warning' : 'text-line'" /></div>
      </div>
      <div v-else-if="data?.canReview" class="mt-8 rounded-[2rem] border border-line bg-surface p-7 shadow-lift">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">A minute of your time</p>
        <h1 class="mt-2 font-display text-3xl font-bold">How was your {{ booking.serviceName }}?</h1>
        <p class="mt-1 text-sm text-muted">With {{ booking.providerName }} at {{ business?.name }}.</p>
        <div class="mt-6 flex justify-center gap-2" role="radiogroup" aria-label="Rating">
          <button v-for="n in 5" :key="n" type="button" class="rounded-xl p-1.5 transition hover:scale-110" :aria-label="`${n} star${n === 1 ? '' : 's'}`" :aria-checked="rating === n" role="radio" @click="rating = n"><Star class="h-9 w-9" :class="n <= rating ? 'fill-warning text-warning' : 'text-line'" /></button>
        </div>
        <p class="mt-2 text-center text-xs font-semibold text-muted">{{ ['', 'Bad', 'Not great', 'Okay', 'Good', 'Excellent'][rating] }}</p>
        <div class="mt-5 space-y-2 rounded-2xl border border-line p-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Rate the details <span class="font-normal normal-case">(optional)</span></p>
          <div v-for="(label, key) in categoryLabels" :key="key" class="flex items-center justify-between gap-2"><span class="text-[11px] font-semibold">{{ label }}</span><div class="flex gap-0.5"><button v-for="n in 5" :key="n" type="button" :aria-label="`${label}: ${n} stars`" @click="categoryRatings[key] = n"><Star class="h-4 w-4" :class="n <= categoryRatings[key] ? 'fill-warning text-warning' : 'text-line'" /></button></div></div>
        </div>
        <div class="mt-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">What stood out?</p><div class="mt-2 flex flex-wrap gap-1.5"><button v-for="tag in tagOptions" :key="tag" type="button" class="rounded-full border px-2.5 py-1.5 text-[10px] font-semibold" :class="tags.includes(tag) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-muted'" @click="toggleTag(tag)">{{ tag }}</button></div></div>
        <label class="mt-4 flex items-center gap-2 rounded-xl bg-raised p-3 text-xs font-semibold"><input v-model="wouldRecommend" type="checkbox" class="h-4 w-4 accent-brand-500"> I would recommend {{ business?.name }} to a friend</label>
        <BaseTextarea v-model="comment" label="Tell them a little more (optional)" placeholder="What did you love? What could be better?" :rows="4" class="mt-5" />
        <p v-if="submitError" class="mt-2 text-xs font-semibold text-danger">{{ submitError }}</p>
        <BaseButton block size="lg" class="mt-4" :loading="busy" @click="save">Publish review</BaseButton>
      </div>
      <div v-else class="mt-8 rounded-[2rem] border border-line bg-surface p-7 text-center">
        <h1 class="font-display text-2xl font-bold">This appointment isn’t ready for a review.</h1>
        <p class="mt-2 text-sm text-muted">Reviews open after the appointment is completed. If you think this is a mistake, contact {{ business?.name }}.</p>
      </div>
    </div>
  </div>
</template>
