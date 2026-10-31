<script setup lang="ts">
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Send, Sparkles, Trash2 } from 'lucide-vue-next';
import { uploadsApi } from '~/api/factories/uploadsApi';
import { customRequestsApi } from '~/api/factories/customRequestsApi';
definePageMeta({ layout: false });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const serviceId = computed(() => typeof route.query.service === 'string' ? route.query.service : '');
const service = computed(() => data.value?.services?.find((item) => item.id === serviceId.value) || data.value?.services?.[0] || null);
useSeoMeta({ title: computed(() => `Request a custom look — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
const form = reactive({ name: '', phone: '', email: '', style: service.value?.name || '', length: '', hairOption: 'not_sure', date: '', time: '', budget: '', notes: '', ref1: '', ref2: '' });
const errors = reactive<Record<string, string>>({});
const submitting = ref(false);
const created = ref<{ publicToken: string } | null>(null);
const budgetKobo = computed(() => Math.round(Number(form.budget.replace(/[^0-9.]/g, '')) * 100) || 0);
const photoInput = ref<HTMLInputElement | null>(null);
const photos = ref<{ url: string; optimizedUrl: string }[]>([]);
const uploading = ref(false);
const uploadError = ref('');
async function addPhotos(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []).slice(0, 3 - photos.value.length);
  input.value = '';
  if (!files.length) return;
  uploading.value = true; uploadError.value = '';
  try {
    for (const file of files) photos.value.push(await uploadsApi.uploadPublicRequestImage(file));
  } catch (err) { uploadError.value = (err as Error).message; }
  finally { uploading.value = false; }
}
function removePhoto(index: number) { photos.value.splice(index, 1); }
async function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!service.value) errors.service = 'Choose a service first.';
  if (form.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!/^(?:234|0)?[789][01]\d{8}$/.test(form.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid Nigerian phone number.';
  if (!form.email) errors.email = 'Add an email so we can send your quote link.';
  if (Object.keys(errors).length) return;
  submitting.value = true;
  try {
    const request = await customRequestsApi.createPublic(slug.value, {
      serviceId: service.value.id, customerName: form.name, customerPhone: form.phone,
      customerEmail: form.email, style: form.style, length: form.length, hairOption: form.hairOption,
      preferredDate: form.date, preferredTime: form.time, budgetKobo: budgetKobo.value, notes: form.notes,
      referenceUrls: [form.ref1, form.ref2].filter((url) => /^https?:\/\//.test(url)),
      referenceImages: photos.value.map((photo) => photo.url),
    });
    created.value = request;
  } catch (err) { errors.form = (err as Error).message; }
  finally { submitting.value = false; }
}
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <template v-if="created">
        <div class="rounded-[2rem] border p-8 text-center" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface }">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 14%, transparent)` }"><CheckCircle2 class="h-8 w-8" :style="{ color: template.colors.primary }" /></div>
          <h1 class="mt-4 font-display text-3xl font-bold" :style="{ color: template.colors.ink }">Your request is with {{ business.name }}.</h1>
          <p class="mt-2 text-sm leading-relaxed" :style="{ color: template.colors.muted }">They’ll review your photos and requirements, then send a quote with price, duration, hair cost and deposit. Keep this link — it is your request record.</p>
          <NuxtLink :to="`/request/${created.publicToken}`" class="mt-6 inline-flex min-h-[50px] items-center rounded-full px-6 text-sm font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Open my request</NuxtLink>
        </div>
      </template>
      <template v-else>
        <NuxtLink :to="`/s/${business.slug}/services`" class="inline-flex items-center gap-1.5 text-xs font-semibold" :style="{ color: template.colors.muted }"><ArrowLeft class="h-4 w-4" /> Back to services</NuxtLink>
        <div class="mt-4">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Custom request</p>
          <h1 class="mt-2 font-display text-4xl font-bold tracking-tight" :style="{ color: template.colors.ink }">Tell them exactly what you want.</h1>
          <p class="mt-2 text-sm leading-relaxed" :style="{ color: template.colors.muted }">Not every style fits a fixed menu. Send your reference, hair preference and preferred date. The business will quote you inside Ojaly.</p>
        </div>
        <form class="mt-6 space-y-4 rounded-2xl border p-5 sm:p-6" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface, borderRadius: template.radius }" @submit.prevent="submit">
          <div class="rounded-xl p-3 text-xs" :style="{ background: `color-mix(in srgb, ${template.colors.primary} 8%, transparent)`, color: template.colors.ink }"><Sparkles class="mr-1 inline h-3.5 w-3.5" /> Requesting: <strong>{{ service?.name || 'Choose a service' }}</strong></div>
          <div class="grid gap-3 sm:grid-cols-2">
            <BaseInput v-model="form.name" label="Your name" placeholder="First and last name" :error="errors.name" required />
            <BaseInput v-model="form.phone" label="WhatsApp number" type="tel" placeholder="0803 123 4567" :error="errors.phone" required />
            <BaseInput v-model="form.email" label="Email" type="email" placeholder="you@example.com" :error="errors.email" required class="sm:col-span-2" />
            <BaseInput v-model="form.style" label="Style you want" placeholder="e.g. Knotless braids, waist length" :error="errors.style" />
            <BaseInput v-model="form.length" label="Length / size" placeholder="e.g. waist length, small" />
            <BaseSelect v-model="form.hairOption" label="Hair" :options="[{ value: 'vendor', label: 'Business should supply the hair' }, { value: 'client', label: 'I will bring my own hair' }, { value: 'not_sure', label: 'Not sure — advise me' }]" />
            <BaseInput v-model="form.budget" label="Budget (optional)" prefix="₦" inputmode="decimal" placeholder="60,000" />
            <BaseInput v-model="form.date" label="Preferred date" type="date" />
            <BaseInput v-model="form.time" label="Preferred time" type="time" />
          </div>
          <BaseTextarea v-model="form.notes" label="Anything else?" placeholder="Colour, density, prep, allergies, preferred finish…" />
          <div>
            <p class="mb-2 text-[11px] font-bold text-ink">Reference photos <span class="font-normal text-muted">(up to 3)</span></p>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="(photo, i) in photos" :key="photo.url" class="group relative aspect-square overflow-hidden rounded-xl border border-line bg-raised">
                <img :src="photo.optimizedUrl" alt="Reference" class="h-full w-full object-cover">
                <button type="button" class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-white" aria-label="Remove photo" @click="removePhoto(i)"><Trash2 class="h-3.5 w-3.5" /></button>
              </div>
              <button v-if="photos.length < 3" type="button" class="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-raised/40 text-muted hover:border-brand-400" :disabled="uploading" @click="photoInput?.click()">
                <Loader2 v-if="uploading" class="h-5 w-5 animate-spin" /><ImagePlus v-else class="h-5 w-5" />
                <span class="text-[9px] font-semibold">{{ uploading ? 'Uploading…' : 'Add photo' }}</span>
              </button>
            </div>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="addPhotos">
            <p v-if="uploadError" class="mt-1 text-[10px] text-danger">{{ uploadError }}</p>
            <p class="mt-1 text-[9px] text-muted">Photos help the business quote accurately. JPG, PNG or WebP, 5MB max.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.ref1" label="Reference link 1" placeholder="Instagram / Pinterest URL" /><BaseInput v-model="form.ref2" label="Reference link 2" placeholder="Optional" /></div>
          <p v-if="errors.form" class="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger">{{ errors.form }}</p>
          <button type="submit" class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold disabled:opacity-50" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" :disabled="submitting || uploading"><Send v-if="!submitting" class="h-4 w-4" /> {{ submitting ? 'Sending request…' : 'Send custom request' }}</button>
          <p class="text-center text-[10px]" :style="{ color: template.colors.muted }">No payment now. You’ll review the quote before accepting.</p>
        </form>
      </template>
    </div>
  </StorefrontShell>
</template>
