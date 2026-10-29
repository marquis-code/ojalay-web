<script setup lang="ts">
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-vue-next';
import { registerSchema, zodErrors } from '~/utils/validators';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Create your business', description: 'Join Ojaly in under five minutes. List products, services or both — campus or community. No card needed.' });
const router = useRouter();
const route = useRoute();
const auth = useAuth();
const toast = useToast();
const businessStore = useBusinessStore();
const { data: categories } = await useBusinessCategories();
const referral = computed(() => typeof route.query.ref === 'string' ? route.query.ref.toUpperCase() : '');
const campus = computed(() => typeof route.query.campus === 'string' ? route.query.campus.toUpperCase() : '');
const ambassador = computed(() => typeof route.query.ambassador === 'string' ? route.query.ambassador.toUpperCase() : '');
const form = reactive({ name: '', email: '', password: '', businessName: '', category: route.query.category as string || '', customCategory: '', businessMode: 'products' as 'products' | 'services' | 'hybrid', address: '', phone: '', referral: referral.value, campus: campus.value, ambassador: ambassador.value });
const errors = reactive<Record<string, string>>({});
const showPassword = ref(false);
const serverError = ref('');
const plan = computed(() => typeof route.query.plan === 'string' ? route.query.plan : '');
const categoryOptions = computed(() => {
  const options = (categories.value || []).map((c) => ({ value: c.key, label: c.label }));
  return options.some((c) => c.value === 'other') ? options : [...options, { value: 'other', label: 'Something else (type it in)' }];
});
const modeOptions = [{ value: 'products', label: 'Products & stock' }, { value: 'services', label: 'Services & appointments' }, { value: 'hybrid', label: 'Both products and services' }];
const isOther = computed(() => form.category === 'other');

async function submit() {
  serverError.value = '';
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (isOther.value && form.customCategory.trim().length < 2) { errors.category = 'Type your business type so customers can find you.'; return; }
  const resolvedCategory = isOther.value ? form.customCategory.trim() : form.category;
  const prepared = {
    ...form,
    category: resolvedCategory,
    customCategory: isOther.value ? form.customCategory.trim() : undefined,
    phone: form.phone?.trim() || undefined,
    address: form.address?.trim() || undefined,
    campus: form.campus?.trim() || undefined,
    ambassador: form.ambassador?.trim() || undefined,
    referral: form.referral?.trim() || undefined,
  };
  const parsed = registerSchema.safeParse(prepared);
  if (!parsed.success) { Object.assign(errors, zodErrors(parsed.error)); return; }
  try {
    await auth.register(prepared);
    businessStore.reset();
    const services = form.businessMode !== 'products';
    toast.success(services ? 'You’re in. Add your services and availability next.' : 'You’re in. Add your first product and watch the numbers come alive.');
    await router.push(services ? '/app/services?onboarding=1' : '/app/products/new?onboarding=1');
  } catch (error) {
    serverError.value = (error as Error).message;
  }
}
</script>

<template>
  <div>
    <div class="mb-7">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-700"><Sparkles class="h-3.5 w-3.5" /> Free to join · campus or community</span>
      <h1 class="mt-4 font-display text-4xl font-bold tracking-[-0.045em]">Set up your business.</h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">Under five minutes. No card. Products, services or both — you do not need to be on a campus.</p>
      <p v-if="plan" class="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">You picked the {{ plan }} plan. Your free trial starts automatically — no payment now.</p>
      <p v-if="campus" class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1.5 text-[11px] font-bold text-accent"><Sparkles class="h-3 w-3" /> {{ campus }} campus launch</p>
      <p v-if="referral" class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-forest-900"><Sparkles class="h-3 w-3" /> Referred with code {{ referral }}</p>
    </div>
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Your name" placeholder="Tola Adeyemi" autocomplete="name" :error="errors.name" required />
      <BaseInput v-model="form.email" label="Email address" type="email" placeholder="you@example.com" autocomplete="email" :error="errors.email" required />
      <BaseInput v-model="form.businessName" label="Business name" placeholder="Tola Thrift" autocomplete="organization" :error="errors.businessName" required hint="This becomes your storefront link too." />
      <BaseSelect v-model="form.category" label="What do you offer?" :options="categoryOptions" placeholder="Pick the closest category" :error="errors.category" required />
      <div v-if="isOther" class="rounded-xl border border-brand-500/20 bg-brand-50/60 p-3"><BaseInput v-model="form.customCategory" label="Type your business type" placeholder="e.g. Podcast studio, wig installation, phone repair" :error="errors.category" required /><p class="mt-1.5 text-[10px] leading-relaxed text-muted">This becomes your category on Ojaly. Choose the closest category above if you are unsure.</p></div>
      <p v-else class="text-[10px] leading-relaxed text-muted">Over 40 categories. If yours is not listed, choose <strong class="text-ink">Something else (type it in)</strong> above.</p>
      <BaseSelect v-model="form.businessMode" label="What do you want to manage?" :options="modeOptions" :error="errors.businessMode" required />
      <BaseInput v-model="form.address" label="Where do you operate?" placeholder="e.g. Yaba, Lagos" :error="errors.address" hint="Campus not required. Add your area or city so customers know where to find you." />
      <BaseInput v-model="form.phone" label="WhatsApp number" inputmode="tel" placeholder="0803 123 4567" autocomplete="tel" :error="errors.phone" hint="Optional, but useful for order alerts." />
      <BaseInput v-model="form.password" label="Create a password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="At least 8 characters" :error="errors.password" required>
        <template #suffix>
          <button type="button" class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
            <EyeOff v-if="showPassword" class="h-4 w-4" /><Eye v-else class="h-4 w-4" />
          </button>
        </template>
      </BaseInput>
      <div v-if="serverError" class="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs font-medium text-danger" role="alert">{{ serverError }}</div>
      <BaseButton type="submit" block size="lg" :loading="auth.loading">Create my business <ArrowRight class="h-4 w-4" /></BaseButton>
    </form>
    <div class="mt-4 grid gap-2 text-[11px] text-muted sm:grid-cols-3">
      <span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-success" /> Free forever tier</span>
      <span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-success" /> No card needed</span>
      <span class="inline-flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-success" /> Data is yours</span>
    </div>
    <p class="mt-3 text-center text-xs font-semibold"><NuxtLink :to="`/phone?campus=${campus}&ambassador=${ambassador}`" class="text-brand-600 underline decoration-brand decoration-2 underline-offset-4">Or start with just your phone →</NuxtLink></p>
    <p class="mt-6 text-center text-sm text-muted">Already have an account? <NuxtLink to="/login" class="font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">Sign in</NuxtLink></p>
  </div>
</template>
