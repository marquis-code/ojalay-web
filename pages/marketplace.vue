<script setup lang="ts">
import { ArrowRight, Check, GraduationCap, MapPin, Search, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: 'default' });
useSeoMeta({
  title: 'Ojaly — book trusted local service businesses in Lagos',
  description: 'Discover verified local service businesses across Lagos. Book and pay securely inside Ojaly. Campus businesses at UNILAG and CMUL included.',
});
const { data: campusData } = await useCampusOverview();
const marketplace = useMarketplace();
const { saving, error, apply } = useCampusApplication();
const open = ref(false);
const done = ref(false);
const selectedCampus = ref('UNILAG');
const form = reactive({ name: '', phone: '', email: '', year: '', socials: '', why: '' });
const campuses = computed(() => marketplace.data.value?.campuses || campusData.value?.campuses || []);
const businesses = computed(() => marketplace.data.value?.businesses || []);
const categories = computed(() => marketplace.data.value?.categories || []);
const board = computed(() => campusData.value?.leaderboard || []);
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => marketplace.query.value, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => marketplace.load(), 300); });
watch(() => [marketplace.campus.value, marketplace.category.value], () => marketplace.load());
function start(code: string) { selectedCampus.value = code; open.value = true; done.value = false; }
async function submit() {
  if (form.name.trim().length < 2 || form.phone.trim().length < 7) return;
  try { await apply({ ...form, campusCode: selectedCampus.value, email: form.email || undefined }); done.value = true; }
  catch { /* error shown */ }
}
onMounted(marketplace.load);
</script>

<template>
  <div class="bg-canvas">
    <section class="relative overflow-hidden bg-forest-900 px-4 pb-14 pt-12 text-white sm:px-6 sm:pb-20 sm:pt-16">
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-wrap items-center gap-2"><span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent"><MapPin class="h-3 w-3" /> Lagos · local service providers</span><span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/70"><ShieldCheck class="h-3 w-3 text-accent" /> Verified providers only — campus and community</span></div>
        <h1 class="mt-5 max-w-4xl font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-bold leading-[0.93] tracking-[-0.055em]">Book the local businesses Lagos already trusts.</h1>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">Hair, food, nails, printing, laundry, design, repairs and more — discover verified local providers, book a real time and pay securely. No DMs, no transfer screenshot, no guesswork.</p>
        <div class="mt-7 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <div class="relative flex-1"><Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input v-model="marketplace.query.value" type="search" placeholder="Search braids, small chops, printing…" class="min-h-[52px] w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"></div>
          <NuxtLink to="/register?campus=UNILAG" class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 text-sm font-bold text-white">List your service <ArrowRight class="h-4 w-4" /></NuxtLink>
        </div>
        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/50"><span class="inline-flex items-center gap-1"><Check class="h-3 w-3 text-accent" /> Book & pay inside Ojaly</span><span class="inline-flex items-center gap-1"><Check class="h-3 w-3 text-accent" /> Verified local providers</span><span class="inline-flex items-center gap-1"><Check class="h-3 w-3 text-accent" /> Reviews after every appointment</span></div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="rounded-full border px-4 py-2 text-xs font-bold" :class="!marketplace.campus.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="marketplace.campus.value = ''">All Lagos</button>
        <button v-for="c in campuses" :key="c.code" type="button" class="rounded-full border px-4 py-2 text-xs font-bold" :class="marketplace.campus.value === c.code ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="marketplace.campus.value = c.code">{{ c.shortName }}</button>
        <span class="mx-1 hidden h-5 w-px bg-line sm:block" />
        <button type="button" class="rounded-full border px-3.5 py-2 text-xs font-bold" :class="!marketplace.category.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="marketplace.category.value = ''">All services</button>
        <button v-for="category in categories" :key="category" type="button" class="rounded-full border px-3.5 py-2 text-xs font-bold" :class="marketplace.category.value === category ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="marketplace.category.value = category">{{ category }}</button>
      </div>

      <div class="mt-7 flex items-end justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">{{ marketplace.campus.value || 'Lagos' }} marketplace</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{{ businesses.length }} verified business{{ businesses.length === 1 ? '' : 'es' }}</h2><p class="mt-1 text-xs text-muted">Every business is reviewed before it appears. Book and pay here — your receipt and record are created automatically.</p></div><span class="hidden text-[10px] font-semibold text-muted sm:block">Sorted by rating</span></div>

      <div v-if="marketplace.loading.value" class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div v-for="i in 3" :key="i" class="skeleton h-64 rounded-3xl" /></div>
      <div v-else-if="businesses.length" class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="business in businesses" :key="business.id" class="card overflow-hidden p-0">
          <div class="relative h-28 overflow-hidden bg-forest-900">
            <img v-if="business.bannerUrl || business.logoUrl" :src="business.bannerUrl || business.logoUrl || ''" :alt="business.name" class="h-full w-full object-cover opacity-80">
            <div v-else class="flex h-full items-center justify-center"><span class="font-display text-3xl font-bold text-white/20">{{ business.name.slice(0, 2).toUpperCase() }}</span></div>
            <span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-forest-900"><ShieldCheck class="h-3 w-3 text-success" /> Verified</span>
            <span v-if="business.rating" class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-forest-900/80 px-2.5 py-1 text-[9px] font-bold text-white"><Star class="h-3 w-3 fill-accent text-accent" /> {{ business.rating }} ({{ business.reviewCount }})</span>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between gap-2"><div><h3 class="font-display text-xl font-bold leading-tight">{{ business.name }}</h3><p class="mt-0.5 text-[10px] font-semibold text-muted">{{ business.campusCode || 'Lagos' }} · {{ business.address || 'Lagos' }}</p></div><p class="shrink-0 text-right text-xs font-bold text-brand-600">from {{ formatNaira(business.minPriceKobo) }}</p></div>
            <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{{ business.tagline || business.description || 'Book a trusted local service.' }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5"><span v-for="service in business.services.slice(0, 2)" :key="service.id" class="rounded-full bg-raised px-2.5 py-1 text-[9px] font-semibold text-muted">{{ service.name }} · {{ service.durationMinutes }}m</span><span v-if="business.serviceCount > 2" class="rounded-full bg-raised px-2.5 py-1 text-[9px] font-semibold text-muted">+{{ business.serviceCount - 2 }} more</span></div>
            <NuxtLink :to="marketplace.open(business)" class="mt-4 flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-ink text-xs font-bold text-canvas">Book & pay <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
          </div>
        </article>
      </div>
      <div v-else class="mt-5 rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-forest-900"><GraduationCap class="h-7 w-7" /></div>
        <h2 class="mt-4 font-display text-2xl font-bold">The first verified businesses are coming.</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">We are reviewing Lagos service businesses now — campus and non-campus. If you run one, get listed first and get your booking link in front of customers.</p>
        <div class="mt-5 flex flex-wrap justify-center gap-2"><NuxtLink :to="`/register${marketplace.campus.value ? `?campus=${marketplace.campus.value}` : ''}`" class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-500 px-5 text-xs font-bold text-white">List my service</NuxtLink><button type="button" class="inline-flex min-h-[44px] items-center rounded-xl border border-line px-5 text-xs font-bold" @click="start(marketplace.campus.value)">Become a campus ambassador</button></div>
      </div>
    </section>

    <section class="border-y border-line bg-surface">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div><p class="eyebrow">The trust layer</p><h2 class="mt-1 font-display text-3xl font-bold">Why book through Ojaly instead of a DM?</h2><div class="mt-4 grid gap-3 text-xs"><p class="flex gap-2"><ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-success" /><span><strong>Verified businesses.</strong> We review the business, service and campus before listing.</span></p><p class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /><span><strong>Real availability.</strong> Book a slot the business can actually keep, with an automatic record.</span></p><p class="flex gap-2"><Check class="mt-0.5 h-4 w-4 shrink-0 text-success" /><span><strong>Pay securely.</strong> Deposit or pay through Paystack, get a receipt and a management link.</span></p><p class="flex gap-2"><Star class="mt-0.5 h-4 w-4 shrink-0 text-warning" /><span><strong>Reviews after the appointment.</strong> Good work compounds. Bad experiences surface.</span></p></div></div>
        <div class="rounded-2xl bg-forest-900 p-6 text-white"><div class="flex items-center justify-between"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Lagos leaderboard</p><Trophy class="h-4 w-4 text-accent" /></div><div class="mt-4 space-y-3"><div v-for="(campus, index) in board" :key="campus.code" class="flex items-center gap-3 rounded-xl bg-white/5 p-3"><span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">{{ index + 1 }}</span><div class="min-w-0 flex-1"><p class="text-sm font-bold">{{ campus.shortName }}</p><p class="text-[10px] text-white/50">{{ campus.activated }} activated · {{ campus.signups }} signups</p></div><span class="font-display text-xl font-bold text-accent">{{ campus.activated }}</span></div></div><p class="mt-4 text-[10px] text-white/40">Activated means a business made its first real sale or booking through Ojaly.</p></div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="rounded-[2rem] border border-line bg-surface p-6 sm:p-8"><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="eyebrow">Ambassadors</p><h2 class="mt-1 font-display text-2xl font-bold">Get paid per activated business, not per signup.</h2><p class="mt-1 max-w-xl text-xs leading-relaxed text-muted">Bring local service businesses to the marketplace, help them set up and get their first paid booking. UNILAG and CMUL are the first communities.</p></div><BaseButton @click="start('UNILAG')">Apply to be an ambassador <ArrowRight class="h-4 w-4" /></BaseButton></div></div>
    </section>

    <BaseModal v-model:open="open" title="Campus ambassador application" :description="`Lagos pilot · ${selectedCampus}`" size="md">
      <div v-if="done" class="py-4 text-center"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success"><Check class="h-7 w-7" /></div><h3 class="mt-3 font-display text-xl font-bold">Application received.</h3><p class="mt-1 text-sm text-muted">We will reach out on WhatsApp within 48 hours.</p><BaseButton class="mt-4" @click="open = false">Done</BaseButton></div>
      <form v-else class="space-y-3" @submit.prevent="submit">
        <div class="flex gap-2"><button v-for="campus in campuses" :key="campus.code" type="button" class="flex-1 rounded-xl border px-3 py-2 text-xs font-bold" :class="selectedCampus === campus.code ? 'border-ink bg-ink text-canvas' : 'border-line'" @click="selectedCampus = campus.code">{{ campus.shortName }}</button></div>
        <BaseInput v-model="form.name" label="Full name" required /><BaseInput v-model="form.phone" label="WhatsApp number" type="tel" required /><BaseInput v-model="form.email" label="Email" type="email" />
        <div class="grid grid-cols-2 gap-3"><BaseInput v-model="form.year" label="Year / level" placeholder="300 level" /><BaseInput v-model="form.socials" label="Instagram / X" placeholder="@yourhandle" /></div>
        <BaseTextarea v-model="form.why" label="Why you?" placeholder="How would you get 20 local service businesses online?" />
        <p v-if="error" class="text-xs font-semibold text-danger">{{ error }}</p>
        <BaseButton type="submit" block :loading="saving">Submit application</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>
