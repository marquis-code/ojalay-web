<script setup lang="ts">
import { ArrowRight, Check, GraduationCap, MapPin, Sparkles, Trophy, Users } from 'lucide-vue-next';
definePageMeta({ layout: 'default' });
useSeoMeta({
  title: 'Ojaly Campus — Lagos',
  description: 'Bring Ojaly to UNILAG and the College of Medicine. Become a campus ambassador, help student businesses get online and earn per activated business.',
});
const { data } = await useCampusOverview();
const { saving, error, apply } = useCampusApplication();
const open = ref(false);
const done = ref(false);
const selectedCampus = ref('UNILAG');
const form = reactive({ name: '', phone: '', email: '', year: '', socials: '', why: '' });
const campuses = computed(() => data.value?.campuses || []);
const board = computed(() => data.value?.leaderboard || []);
function start(code: string) { selectedCampus.value = code; open.value = true; done.value = false; }
async function submit() {
  if (form.name.trim().length < 2 || form.phone.trim().length < 7) return;
  try {
    await apply({ ...form, campusCode: selectedCampus.value, email: form.email || undefined });
    done.value = true;
  } catch { /* error shown */ }
}
</script>

<template>
  <div class="bg-canvas">
    <section class="relative overflow-hidden bg-forest-900 px-4 py-16 text-white sm:px-6 sm:py-24">
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent"><MapPin class="h-3 w-3" /> Lagos · UNILAG · CMUL</span>
          <h1 class="mt-5 max-w-3xl font-display text-[clamp(2.8rem,7vw,5.8rem)] font-bold leading-[0.92] tracking-[-0.06em]">Every student business deserves a real shop link.</h1>
          <p class="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">Ojaly Campus is a Lagos pilot: we set up student businesses for free, give them a storefront, receipts, profit tracking and bookings — then help them make their first real sale.</p>
          <div class="mt-7 flex flex-wrap gap-2">
            <NuxtLink to="/register?campus=UNILAG" class="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-bold text-white">Start free for UNILAG <ArrowRight class="h-4 w-4" /></NuxtLink>
            <button type="button" class="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-bold text-white" @click="start('UNILAG')">Become a campus ambassador</button>
          </div>
          <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-white/60"><span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-accent" /> No CAC</span><span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-accent" /> No card</span><span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-accent" /> Free to start</span><span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-accent" /> Set up in 3 minutes</span></div>
        </div>
        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div class="flex items-center justify-between"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Lagos leaderboard</p><Trophy class="h-4 w-4 text-accent" /></div>
          <div class="mt-4 space-y-3">
            <div v-for="(campus, index) in board" :key="campus.code" class="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">{{ index + 1 }}</span>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ campus.shortName }}</p><p class="text-[10px] text-white/50">{{ campus.signups }} signups · {{ campus.activated }} activated</p></div>
              <span class="font-display text-xl font-bold text-accent">{{ campus.activated }}</span>
            </div>
          </div>
          <p class="mt-4 text-[10px] text-white/40">Updated live. Activated means a business shared its link and made its first recorded sale.</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p class="eyebrow">The pilot</p><h2 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Two campuses. One mission.</h2><p class="mt-2 max-w-xl text-sm text-muted">We are starting with the University of Lagos and the College of Medicine. The goal is 200 activated student businesses before we expand.</p></div><div class="rounded-2xl bg-accent px-4 py-3 text-xs font-bold text-forest-900">Lagos · 2026</div></div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <article v-for="campus in campuses" :key="campus.code" class="card p-6">
          <div class="flex items-start justify-between gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-accent"><GraduationCap class="h-6 w-6" /></div><span class="rounded-full bg-raised px-2.5 py-1 text-[10px] font-bold text-muted">{{ campus.city }}</span></div>
          <h3 class="mt-4 font-display text-2xl font-bold">{{ campus.shortName }}</h3>
          <p class="mt-1 text-xs text-muted">{{ campus.name }} · {{ campus.signups }} businesses signed up · {{ campus.activated }} activated</p>
          <div class="mt-5 grid grid-cols-3 gap-2 text-center"><div class="rounded-xl bg-raised/60 p-2"><p class="font-display text-xl font-bold">{{ campus.signups }}</p><p class="text-[9px] uppercase tracking-wider text-muted">Signups</p></div><div class="rounded-xl bg-raised/60 p-2"><p class="font-display text-xl font-bold text-success">{{ campus.activated }}</p><p class="text-[9px] uppercase tracking-wider text-muted">Activated</p></div><div class="rounded-xl bg-raised/60 p-2"><p class="font-display text-xl font-bold">{{ campus.applications }}</p><p class="text-[9px] uppercase tracking-wider text-muted">Leads</p></div></div>
          <div class="mt-5 flex gap-2"><NuxtLink :to="`/register?campus=${campus.code}`" class="flex min-h-[42px] flex-1 items-center justify-center rounded-xl bg-ink text-xs font-bold text-canvas">Start free</NuxtLink><button type="button" class="rounded-xl border border-line px-3 text-xs font-bold" @click="start(campus.code)">Ambassador</button></div>
        </article>
      </div>
    </section>

    <section class="border-y border-line bg-surface">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div><p class="eyebrow">The ambassador role</p><h2 class="mt-1 font-display text-3xl font-bold">Get paid for activation, not signups.</h2><p class="mt-3 text-sm leading-relaxed text-muted">You bring student businesses to Ojaly, help them add one product or service and share their link. We pay per business that actually activates. Top ambassadors get cash bonuses, free Hustle and a public spotlight.</p><div class="mt-5 grid gap-2 text-xs"><p class="flex items-center gap-2"><Check class="h-4 w-4 text-success" /> ₦1,000–₦1,500 per activated business</p><p class="flex items-center gap-2"><Check class="h-4 w-4 text-success" /> Weekly leaderboard and bonuses</p><p class="flex items-center gap-2"><Check class="h-4 w-4 text-success" /> Free premium for your own business</p><p class="flex items-center gap-2"><Check class="h-4 w-4 text-success" /> Training, scripts and activation materials</p></div><BaseButton class="mt-6" @click="start('UNILAG')">Apply to be an ambassador <ArrowRight class="h-4 w-4" /></BaseButton></div>
        <div class="rounded-2xl bg-forest-900 p-6 text-white"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">The activation playbook</p><ol class="mt-4 space-y-4 text-sm text-white/75"><li><strong class="text-white">1. Ask what they sell.</strong><br>Only talk to students already selling.</li><li><strong class="text-white">2. Build the link with them.</strong><br>One photo, one price, one link.</li><li><strong class="text-white">3. Post it on WhatsApp status.</strong><br>The first shared link is the activation.</li><li><strong class="text-white">4. Follow up in 48 hours.</strong><br>Help them send the link to five customers.</li></ol></div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div class="rounded-[2rem] border border-line bg-surface p-6 sm:p-8"><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p class="eyebrow">Campus waitlist</p><h2 class="mt-1 font-display text-2xl font-bold">Not UNILAG or CMUL? Tell us your campus.</h2><p class="mt-1 text-xs text-muted">We will open the next city based on demand. Join the list and bring a friend.</p></div><BaseButton @click="start('UNILAG')">Join the ambassador list</BaseButton></div></div>
    </section>

    <BaseModal v-model:open="open" title="Campus ambassador application" :description="`Lagos pilot · ${selectedCampus}`" size="md">
      <div v-if="done" class="py-4 text-center"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success"><Check class="h-7 w-7" /></div><h3 class="mt-3 font-display text-xl font-bold">Application received.</h3><p class="mt-1 text-sm text-muted">We will reach out on WhatsApp within 48 hours. Bring one friend who sells.</p><BaseButton class="mt-4" @click="open = false">Done</BaseButton></div>
      <form v-else class="space-y-3" @submit.prevent="submit">
        <div class="flex gap-2"><button v-for="campus in campuses" :key="campus.code" type="button" class="flex-1 rounded-xl border px-3 py-2 text-xs font-bold" :class="selectedCampus === campus.code ? 'border-ink bg-ink text-canvas' : 'border-line'" @click="selectedCampus = campus.code">{{ campus.shortName }}</button></div>
        <BaseInput v-model="form.name" label="Full name" required />
        <BaseInput v-model="form.phone" label="WhatsApp number" type="tel" required />
        <BaseInput v-model="form.email" label="Email" type="email" />
        <div class="grid grid-cols-2 gap-3"><BaseInput v-model="form.year" label="Year / level" placeholder="300 level" /><BaseInput v-model="form.socials" label="Instagram / X" placeholder="@yourhandle" /></div>
        <BaseTextarea v-model="form.why" label="Why you?" placeholder="Tell us how you would get 20 student businesses online." />
        <p v-if="error" class="text-xs font-semibold text-danger">{{ error }}</p>
        <BaseButton type="submit" block :loading="saving">Submit application</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>
