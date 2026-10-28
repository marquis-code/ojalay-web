<script setup lang="ts">
import { ArrowRight, Check, PackageCheck, Sparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import type { ServicePackage } from '~/types';
definePageMeta({ layout: false });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data } = await useStorefrontPackages(slug);
const { checkout: purchase } = usePackageCheckout(slug);
if (!data.value?.items.length) throw createError({ statusCode: 404, statusMessage: 'Packages not found', fatal: true });
const toast = useToast();
const selected = ref<ServicePackage | null>(null);
const open = ref(false);
const saving = ref(false);
const form = reactive({ customerName: '', customerPhone: '', customerEmail: '' });
function buy(item: ServicePackage) { selected.value = item; form.customerName = ''; form.customerPhone = ''; form.customerEmail = ''; open.value = true; }
async function checkout() {
  if (!selected.value || form.customerName.trim().length < 2 || form.customerPhone.trim().length < 7) return toast.error('Add your name and phone number.');
  saving.value = true;
  try {
    const result = await purchase(selected.value.id, { customerName: form.customerName.trim(), customerPhone: form.customerPhone.trim(), customerEmail: form.customerEmail || undefined });
    if (result.payment?.authorizationUrl) window.location.href = result.payment.authorizationUrl;
    else toast.info('Package created. Ask the business for your code.');
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
</script>

<template>
  <StorefrontShell v-if="data" :business="data.business" :template="data.template">
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: data.template.colors.primary }">Prepaid & memberships</p>
      <h1 class="mt-2 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl" :style="{ color: data.template.colors.ink }">Buy once. Book when you’re ready.</h1>
      <p class="mt-2 max-w-xl text-sm leading-relaxed" :style="{ color: data.template.colors.muted }">Save on repeat visits and skip the payment step when you book.</p>
      <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="item in data.items" :key="item.id" class="flex flex-col rounded-2xl border p-5" :style="{ borderColor: `color-mix(in srgb, ${data.template.colors.ink} 12%, transparent)`, background: data.template.colors.surface }">
          <div class="flex items-start justify-between gap-2"><div><p class="text-[9px] font-bold uppercase tracking-wider" :style="{ color: data.template.colors.primary }">{{ item.isMembership ? 'Membership' : 'Package' }}</p><h2 class="mt-1 font-display text-xl font-bold" :style="{ color: data.template.colors.ink }">{{ item.name }}</h2></div><PackageCheck class="h-5 w-5 opacity-40" :style="{ color: data.template.colors.primary }" /></div>
          <p class="mt-2 text-xs leading-relaxed" :style="{ color: data.template.colors.muted }">{{ item.description || `${item.sessions} sessions of ${item.serviceName}.` }}</p>
          <div class="mt-4 space-y-1 text-[11px]" :style="{ color: data.template.colors.muted }"><p class="flex items-center gap-1.5"><Check class="h-3 w-3" /> {{ item.sessions }} sessions</p><p class="flex items-center gap-1.5"><Check class="h-3 w-3" /> Valid for {{ item.validityDays }} days</p><p class="flex items-center gap-1.5"><Check class="h-3 w-3" /> {{ item.serviceName }}</p></div>
          <div class="mt-auto flex items-end justify-between pt-5"><p class="font-display text-2xl font-bold" :style="{ color: data.template.colors.primary }">{{ formatNaira(item.priceKobo) }}</p><button type="button" class="inline-flex min-h-[40px] items-center gap-1 rounded-full px-4 text-xs font-bold" :style="{ background: data.template.colors.primary, color: data.template.colors.onPrimary }" @click="buy(item)">Buy <ArrowRight class="h-3.5 w-3.5" /></button></div>
        </article>
      </div>
    </section>
    <BaseModal v-model:open="open" :title="selected?.name || 'Buy package'" :description="selected ? `${selected.sessions} sessions · ${formatNaira(selected.priceKobo)}` : ''" size="sm">
      <form class="space-y-3" @submit.prevent="checkout">
        <BaseInput v-model="form.customerName" label="Your name" required />
        <BaseInput v-model="form.customerPhone" label="WhatsApp number" type="tel" required />
        <BaseInput v-model="form.customerEmail" label="Email" type="email" placeholder="For your receipt" />
        <BaseButton type="submit" block :loading="saving">Pay securely</BaseButton>
        <p class="text-center text-[10px] text-muted">You’ll get a redemption code after payment.</p>
      </form>
    </BaseModal>
  </StorefrontShell>
</template>
