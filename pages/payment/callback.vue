<script setup lang="ts">
import { CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-vue-next';
import { clearPendingPayment, readPendingPayment } from '~/utils/pending-payment';
definePageMeta({ layout: false });
const route = useRoute();
const router = useRouter();
const stored = readPendingPayment();
const queryReference = typeof route.query.reference === 'string' ? route.query.reference : typeof route.query.trxref === 'string' ? route.query.trxref : '';
const reference = ref(queryReference || stored?.reference || '');
const retrying = ref(false);
const verification = usePaymentVerification();
const status = verification.status;
const nextUrl = verification.nextUrl;
const message = verification.message;
useSeoMeta({ title: 'Payment status', robots: 'noindex' });

function cleanUrl(raw?: string | null): string {
  if (!raw) return '';
  const str = String(raw).trim();
  if (/^https?:\/\//i.test(str)) {
    try {
      const parsed = new URL(str);
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return str.replace(/^https?:\/\/[^/]+/i, '') || '/';
    }
  }
  return str.startsWith('/') ? str : `/${str}`;
}

const targetUrl = computed(() => cleanUrl(nextUrl.value));

async function verifyCurrent() {
  if (!reference.value) return;
  retrying.value = true;
  try {
    await verification.verify(reference.value);
    if (status.value === 'success') {
      clearPendingPayment();
      if (targetUrl.value) setTimeout(() => { void navigateTo(targetUrl.value); }, 2200);
    }
  } finally { retrying.value = false; }
}
onMounted(async () => {
  if (!reference.value) {
    status.value = 'failed';
    message.value = 'We could not find a payment reference. If you were charged, open the order or booking link from your receipt and try again.';
    return;
  }
  await verifyCurrent();
});
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas p-4">
    <div class="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lift">
      <template v-if="status === 'checking'"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-raised"><Clock class="h-8 w-8 animate-pulse text-brand-500" /></div><h1 class="mt-4 font-display text-2xl font-bold">Checking your payment…</h1><p class="mt-1 text-sm text-muted">Hold on, we're confirming it with Paystack.</p></template>
      <template v-else-if="status === 'success'"><CheckCircle2 class="mx-auto h-16 w-16 text-success" /><h1 class="mt-4 font-display text-2xl font-bold">Payment confirmed</h1><p class="mt-1 text-sm text-muted">Thank you. The business has been updated automatically.</p><NuxtLink v-if="targetUrl" :to="targetUrl" class="mt-5 inline-flex rounded-full bg-brand-500 px-5 py-3 text-xs font-bold text-white">Continue</NuxtLink></template>
      <template v-else-if="status === 'pending'"><Clock class="mx-auto h-16 w-16 text-warning" /><h1 class="mt-4 font-display text-2xl font-bold">Still processing</h1><p class="mt-1 text-sm text-muted">{{ message }}</p><button class="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-canvas" :disabled="retrying" @click="verifyCurrent"><RefreshCw class="h-3.5 w-3.5" :class="retrying ? 'animate-spin' : ''" /> Check again</button></template>
      <template v-else><XCircle class="mx-auto h-16 w-16 text-danger" /><h1 class="mt-4 font-display text-2xl font-bold">Payment not confirmed</h1><p class="mt-1 text-sm text-muted">{{ message || 'Nothing was charged or the payment failed. You can try again from the original link.' }}</p><div class="mt-5 flex flex-col items-center gap-2"><button v-if="reference" type="button" class="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-canvas" :disabled="retrying" @click="verifyCurrent"><RefreshCw class="h-3.5 w-3.5" :class="retrying ? 'animate-spin' : ''" /> Try verification again</button><NuxtLink to="/" class="text-xs font-bold text-muted underline underline-offset-4">Back home</NuxtLink></div></template>
    </div>
  </div>
</template>
