<script setup lang="ts">
import { Check, CreditCard, PackageCheck, Sparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: false });
useSeoMeta({ title: 'Your package', robots: 'noindex,nofollow' });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error, refresh } = await usePackagePurchase(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Package not found', fatal: true });
const { payPackage } = usePackagePayments();
const busy = ref(false);
const toast = useToast();
async function pay() {
  busy.value = true;
  try { const result = await payPackage(token.value, data.value?.purchase.customerEmail || undefined); window.location.href = result.authorizationUrl; }
  catch (err) { toast.error((err as Error).message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div v-if="data" class="min-h-dvh bg-canvas px-4 py-10 text-ink">
    <div class="mx-auto max-w-lg">
      <NuxtLink to="/" class="inline-flex items-center gap-2"><LogoMark /></NuxtLink>
      <div class="mt-8 rounded-[2rem] border border-line bg-surface p-7 shadow-lift">
        <div class="flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><PackageCheck class="h-6 w-6" /></div><div><p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">{{ data.package?.isMembership ? 'Membership' : 'Package' }}</p><h1 class="font-display text-2xl font-bold">{{ data.purchase.packageName }}</h1><p class="text-xs text-muted">{{ data.business?.name }}</p></div></div>
        <div class="mt-5 grid gap-2 text-xs">
          <div class="flex justify-between rounded-xl bg-raised/60 p-3"><span class="text-muted">Sessions</span><span class="font-bold">{{ data.purchase.sessionsRemaining }} of {{ data.purchase.sessionsTotal }} left</span></div>
          <div class="flex justify-between rounded-xl bg-raised/60 p-3"><span class="text-muted">Valid until</span><span class="font-bold">{{ new Date(data.purchase.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span></div>
          <div class="flex justify-between rounded-xl bg-raised/60 p-3"><span class="text-muted">Total</span><span class="font-bold">{{ formatNaira(data.purchase.priceKobo) }}</span></div>
          <div class="flex justify-between rounded-xl bg-raised/60 p-3"><span class="text-muted">Status</span><BaseBadge :variant="data.purchase.status === 'active' ? 'success' : 'warning'">{{ data.purchase.status }}</BaseBadge></div>
        </div>
        <div v-if="data.purchase.status === 'active'" class="mt-5 rounded-2xl bg-brand-50 p-4 text-center"><p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">Your redemption code</p><p class="mt-1 font-display text-3xl font-bold tracking-[0.2em] text-brand-700">{{ data.purchase.redemptionCode }}</p><p class="mt-2 text-[10px] text-brand-700/80">Use this code when booking {{ data.purchase.serviceName }}.</p></div>
        <div v-else-if="data.purchase.status === 'pending'" class="mt-5"><BaseButton block :loading="busy" @click="pay"><CreditCard class="h-4 w-4" /> Pay {{ formatNaira(data.purchase.priceKobo) }}</BaseButton><p class="mt-2 text-center text-[10px] text-muted">Your code appears here after payment.</p></div>
        <div v-if="data.purchase.status === 'active'" class="mt-4"><NuxtLink v-if="data.business?.slug" :to="`/s/${data.business.slug}/services/${data.purchase.serviceId}`" class="flex min-h-[44px] items-center justify-center rounded-xl bg-ink text-xs font-bold text-canvas">Book a session</NuxtLink></div>
      </div>
    </div>
  </div>
</template>
