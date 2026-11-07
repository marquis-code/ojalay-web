<script setup lang="ts">
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, WifiOff } from 'lucide-vue-next';
const auth = useAuthStore();
const businessStore = useBusinessStore();
const offline = useOfflineStore();
const sidebarOpen = ref(false);
const loadError = ref<string | null>(null);
const config = useRuntimeConfig();
const subscriptionPromptOpen = ref(false);
const subscriptionExpired = computed(() => businessStore.subscription?.status === 'expired' || (businessStore.subscription?.status === 'trialing' && businessStore.trialDaysLeft === 0));
function exitImpersonation() {
  const businessId = auth.exitImpersonation();
  window.location.href = businessId ? `${config.public.adminUrl}/businesses/${businessId}` : `${config.public.adminUrl}/businesses`;
}

async function loadBusiness() {
  try {
    loadError.value = null;
    await businessStore.load();
    if (subscriptionExpired.value && !subscriptionPromptOpen.value) subscriptionPromptOpen.value = true;
  } catch (error) {
    loadError.value = (error as Error).message;
  }
}

watch(() => auth.activeBusinessId, async () => { businessStore.reset(); await loadBusiness(); });
onMounted(loadBusiness);
</script>

<template>
  <div class="min-h-dvh bg-canvas">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="lg:pl-[264px]">
      <AppTopbar @toggle-menu="sidebarOpen = true" />

      <div v-if="auth.isImpersonating" class="border-b border-accent/30 bg-accent px-4 py-2.5 text-xs text-forest-900 sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-2"><span class="inline-flex items-center gap-2 font-bold"><ShieldAlert class="h-4 w-4" /> Support impersonation — actions are audited. Session expires {{ auth.impersonation?.expiresAt ? new Date(auth.impersonation.expiresAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : 'soon' }}.</span><button type="button" class="rounded-lg bg-forest-900 px-3 py-1.5 text-[10px] font-bold text-white" @click="exitImpersonation">Exit to admin</button></div>
      </div>

      <div v-if="!offline.online || offline.pendingCount" class="border-b border-warning/20 bg-warning/10 px-4 py-2.5 text-xs sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="inline-flex items-center gap-2 font-semibold text-warning"><WifiOff class="h-3.5 w-3.5" />{{ offline.online ? `${offline.pendingCount} offline ${offline.pendingCount === 1 ? 'entry' : 'entries'} waiting to sync` : 'You are offline. Sales and expenses are safe on this device.' }}</span>
          <NuxtLink to="/app/offline" class="inline-flex items-center gap-1 font-bold text-warning">Open queue <ArrowRight class="h-3 w-3" /></NuxtLink>
        </div>
      </div>

      <div v-if="subscriptionExpired" class="border-b border-danger/20 bg-danger/5 px-4 py-3 text-xs sm:px-8"><div class="flex flex-wrap items-center justify-between gap-2"><span class="inline-flex items-center gap-2 font-semibold text-danger"><AlertTriangle class="h-4 w-4" /> Your free month has ended. Choose a plan to keep your business growing.</span><NuxtLink to="/app/settings?tab=billing" class="rounded-lg bg-danger px-3 py-1.5 text-[10px] font-bold text-white">Choose a plan</NuxtLink></div></div>

      <div v-if="businessStore.isTrial" class="border-b border-brand-200 bg-brand-50 px-4 py-2.5 text-xs dark:border-brand-500/30 dark:bg-brand-500/10 sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-semibold text-brand-800 dark:text-brand-200">Your {{ businessStore.plan?.name }} trial ends in {{ businessStore.trialDaysLeft }} day{{ businessStore.trialDaysLeft === 1 ? '' : 's' }}. Your data stays even if you don't upgrade.</span>
          <NuxtLink to="/app/settings?tab=billing" class="font-bold text-brand-700 underline underline-offset-2 dark:text-brand-300">See plans</NuxtLink>
        </div>
      </div>

      <div v-if="auth.user && !auth.user.emailVerified" class="border-b border-line bg-raised px-4 py-2.5 text-xs sm:px-8">
        <NuxtLink to="/app/settings?tab=profile" class="inline-flex items-center gap-2 font-semibold text-muted"><AlertTriangle class="h-3.5 w-3.5 text-warning" /> Confirm your email so you never lose access to receipts. <span class="text-brand underline">Verify now</span></NuxtLink>
      </div>

      <main class="shell py-6 pb-28 sm:py-8 lg:pb-12">
        <div v-if="loadError" class="card p-6">
          <p class="font-display text-xl font-bold">We couldn't load your business</p>
          <p class="mt-2 text-sm text-muted">{{ loadError }}</p>
          <BaseButton class="mt-4" size="sm" @click="loadBusiness">Try again</BaseButton>
        </div>
        <div v-else-if="businessStore.loading && !businessStore.context" class="space-y-4">
          <div class="skeleton h-10 w-64" />
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div v-for="i in 4" :key="i" class="skeleton h-36 rounded-3xl" /></div>
          <div class="skeleton h-72 rounded-3xl" />
        </div>
        <slot v-else />
      </main>
    </div>
    <MobileNav />
    <SupportChatWidget :show-whatsapp="false" />
    <TourOverlay />
    <BaseModal v-model:open="subscriptionPromptOpen" title="Your 30-day free trial has ended" description="Choose a plan to keep using Ojaly. Your data is safe and waiting for you." size="sm">
      <div class="space-y-3 text-sm text-muted"><p>Your business had one full month free. Subscribe now to continue managing sales, bookings, customers, payments and your team in one place.</p><div class="rounded-xl bg-raised p-3 text-xs"><p class="font-bold text-ink">Plans start from ₦2,500/month</p><p class="mt-1">Monthly or yearly billing. No setup fee.</p></div></div>
      <div class="mt-5 flex gap-2"><BaseButton block to="/app/settings?tab=billing">Choose a plan</BaseButton><BaseButton variant="ghost" @click="subscriptionPromptOpen = false">Later</BaseButton></div>
    </BaseModal>
  </div>
</template>
