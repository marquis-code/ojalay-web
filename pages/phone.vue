<script setup lang="ts">
import { ArrowRight, Phone, ShieldCheck, Sparkles } from 'lucide-vue-next';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Continue with phone', description: 'Create your Ojaly business with your phone number. No password needed.' });
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const toast = useToast();
const campus = computed(() => typeof route.query.campus === 'string' ? route.query.campus.toUpperCase() : '');
const ambassador = computed(() => typeof route.query.ambassador === 'string' ? route.query.ambassador.toUpperCase() : '');
const step = ref(1);
const busy = ref(false);
const error = ref('');
const channel = ref<'sms' | 'email' | ''>('');
const form = reactive({ phone: '', name: '', businessName: '', email: '', category: 'other', campus: campus.value, ambassador: ambassador.value });
const code = ref('');
async function request() {
  error.value = '';
  if (form.phone.trim().length < 7) { error.value = 'Enter a valid phone number.'; return; }
  busy.value = true;
  try {
    const result = await auth.phoneStart({ ...form, name: form.name || undefined, businessName: form.businessName || undefined, email: form.email || undefined, campus: form.campus || undefined, ambassador: form.ambassador || undefined });
    channel.value = result.channel;
    step.value = 2;
    toast.success(`Code sent by ${result.channel}. It expires in 10 minutes.`);
  } catch (err) { error.value = (err as Error).message; }
  finally { busy.value = false; }
}
async function verify() {
  error.value = '';
  if (code.value.trim().length !== 6) { error.value = 'Enter the 6-digit code.'; return; }
  busy.value = true;
  try {
    await auth.phoneVerify({ phone: form.phone, code: code.value });
    toast.success('You’re in. Add your first product or service.');
    await router.push('/app');
  } catch (err) { error.value = (err as Error).message; }
  finally { busy.value = false; }
}
</script>

<template>
  <div>
    <div class="mb-7">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-forest-900"><Phone class="h-3.5 w-3.5" /> Phone-first</span>
      <h1 class="mt-4 font-display text-4xl font-bold tracking-[-0.045em]">Start with your phone.</h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">No password to remember. We send a 6-digit code by SMS, or email if SMS is not available.</p>
      <p v-if="campus" class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1.5 text-[11px] font-bold text-accent"><Sparkles class="h-3 w-3" /> {{ campus }} campus launch</p>
    </div>

    <form v-if="step === 1" class="space-y-4" @submit.prevent="request">
      <BaseInput v-model="form.phone" label="Phone number" type="tel" placeholder="0803 123 4567" required />
      <BaseInput v-model="form.name" label="Your name" placeholder="Tola Adeyemi" />
      <BaseInput v-model="form.businessName" label="Business name" placeholder="Tola Thrift" />
      <BaseInput v-model="form.email" label="Email (for the fallback code)" type="email" placeholder="you@example.com" />
      <p v-if="error" class="rounded-xl bg-danger/5 p-3 text-xs font-semibold text-danger">{{ error }}</p>
      <BaseButton type="submit" block size="lg" :loading="busy">Send my code <ArrowRight class="h-4 w-4" /></BaseButton>
      <p class="text-center text-[10px] text-muted">New here? Your business and free storefront are created after you verify.</p>
    </form>

    <form v-else class="space-y-4" @submit.prevent="verify">
      <div class="rounded-2xl bg-raised/70 p-4 text-xs leading-relaxed text-muted">Code sent to <strong class="text-ink">{{ form.phone }}</strong> by {{ channel }}. <button type="button" class="font-bold text-brand-600" @click="step = 1">Change number</button></div>
      <BaseInput v-model="code" label="6-digit code" inputmode="numeric" :maxlength="6" placeholder="123456" required />
      <p v-if="error" class="rounded-xl bg-danger/5 p-3 text-xs font-semibold text-danger">{{ error }}</p>
      <BaseButton type="submit" block size="lg" :loading="busy"><ShieldCheck class="h-4 w-4" /> Verify & continue</BaseButton>
      <button type="button" class="w-full text-center text-xs font-semibold text-muted" @click="request">Send a new code</button>
    </form>

    <p class="mt-6 text-center text-sm text-muted">Prefer email? <NuxtLink to="/register" class="font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">Create with email</NuxtLink></p>
    <p class="mt-2 text-center text-sm text-muted">Already have an account? <NuxtLink to="/login" class="font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">Sign in</NuxtLink></p>
  </div>
</template>
