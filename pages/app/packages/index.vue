<script setup lang="ts">
import { PackageCheck, Plus, Sparkles, Ticket } from 'lucide-vue-next';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
import type { ServicePackage } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Packages' });

const toast = useToast();
const { items, purchases, loading, load, create, update, remove } = usePackages();
const { items: services, load: loadServices } = useServices();
const open = ref(false);
const saving = ref(false);
const editing = ref<ServicePackage | null>(null);
const form = reactive({ name: '', description: '', serviceId: '', sessions: '5', price: '', validityDays: '30', isMembership: false, isActive: true });
const activePurchases = computed(() => purchases.value.filter((p) => p.status === 'active'));
const sessionsLeft = computed(() => activePurchases.value.reduce((sum, p) => sum + p.sessionsRemaining, 0));
const serviceOptions = computed(() => services.value.filter((s) => s.isActive).map((s) => ({ value: s.id, label: s.name })));
function reset() { Object.assign(form, { name: '', description: '', serviceId: services.value[0]?.id || '', sessions: '5', price: '', validityDays: '30', isMembership: false, isActive: true }); editing.value = null; }
function openCreate() { reset(); open.value = true; }
function openEdit(item: ServicePackage) { editing.value = item; Object.assign(form, { name: item.name, description: item.description, serviceId: item.serviceId, sessions: String(item.sessions), price: nairaInput(item.priceKobo), validityDays: String(item.validityDays), isMembership: item.isMembership, isActive: item.isActive }); open.value = true; }
async function save() {
  if (form.name.trim().length < 2 || !form.serviceId) return toast.error('Add a name and choose a service.');
  if (!nairaToKobo(form.price)) return toast.error('Add a package price.');
  saving.value = true;
  try {
    const payload = { name: form.name.trim(), description: form.description, serviceId: form.serviceId, sessions: Number(form.sessions), priceKobo: nairaToKobo(form.price), validityDays: Number(form.validityDays), isMembership: form.isMembership, isActive: form.isActive, isPublic: true };
    if (editing.value) await update(editing.value.id, payload); else await create(payload);
    toast.success('Package saved.'); open.value = false;
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function hide(item: ServicePackage) { try { await remove(item.id); toast.success('Package hidden.'); } catch (error) { toast.error((error as Error).message); } }
onMounted(async () => { await Promise.all([load(), loadServices()]); if (!form.serviceId) form.serviceId = services.value[0]?.id || ''; });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Packages & memberships" subtitle="Sell prepaid sessions your clients can redeem when they book." eyebrow="Prepaid">
      <template #actions><BaseButton @click="openCreate"><Plus class="h-4 w-4" /> New package</BaseButton></template>
    </PageHeader>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Packages</p><p class="mt-1 font-display text-2xl font-bold">{{ items.filter((i) => i.isActive).length }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Active clients</p><p class="mt-1 font-display text-2xl font-bold">{{ activePurchases.length }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Sessions remaining</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ sessionsLeft }}</p></div>
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2"><div v-for="i in 2" :key="i" class="skeleton h-40 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="Turn regulars into prepaid clients" message="Sell 5 braids upfront, a monthly nail membership or a bridal package. Clients get a code and redeem it when they book." action-label="Create a package" @action="openCreate">
      <template #icon><PackageCheck class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in items" :key="item.id" class="card p-5">
        <div class="flex items-start justify-between gap-2"><div><p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">{{ item.isMembership ? 'Membership' : 'Package' }}</p><h3 class="mt-1 font-display text-xl font-bold">{{ item.name }}</h3></div><BaseBadge :variant="item.isActive ? 'success' : 'neutral'">{{ item.isActive ? 'Selling' : 'Hidden' }}</BaseBadge></div>
        <p class="mt-1 text-xs text-muted">{{ item.serviceName }} · {{ item.sessions }} session{{ item.sessions === 1 ? '' : 's' }} · {{ item.validityDays }} days</p>
        <p class="mt-4 font-display text-2xl font-bold">{{ formatNaira(item.priceKobo) }}</p>
        <div class="mt-4 flex gap-1 border-t border-line pt-3"><button class="flex-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised" @click="openEdit(item)">Edit</button><button class="rounded-xl px-3 py-2 text-[11px] font-bold text-danger hover:bg-danger/5" @click="hide(item)">Hide</button></div>
      </article>
    </div>

    <BaseCard v-if="purchases.length">
      <h2 class="font-display text-lg font-bold">Recent purchases</h2>
      <div class="mt-3 divide-y divide-line"><div v-for="purchase in purchases.slice(0, 20)" :key="purchase.id" class="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><div><p class="font-bold">{{ purchase.customerName }} · {{ purchase.packageName }}</p><p class="text-[10px] text-muted">{{ purchase.sessionsRemaining }}/{{ purchase.sessionsTotal }} left · code {{ purchase.redemptionCode }} · expires {{ formatDate(purchase.expiresAt) }}</p></div><div class="text-right"><BaseBadge :variant="purchase.status === 'active' ? 'success' : purchase.status === 'pending' ? 'warning' : 'neutral'">{{ purchase.status }}</BaseBadge><p class="mt-1 text-[10px] text-muted">{{ formatNaira(purchase.priceKobo) }}</p></div></div></div>
    </BaseCard>

    <BaseModal v-model:open="open" :title="editing ? 'Edit package' : 'New package'" description="A prepaid bundle or membership for one service." size="md">
      <form class="space-y-4" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Name" placeholder="5 braids upfront" required />
        <BaseSelect v-model="form.serviceId" :options="serviceOptions" label="Service" placeholder="Choose a service" required />
        <BaseTextarea v-model="form.description" label="Description" placeholder="What is included?" />
        <div class="grid grid-cols-2 gap-3"><BaseInput v-model="form.sessions" label="Sessions" type="number" min="1" /><BaseInput v-model="form.price" label="Price" prefix="₦" inputmode="decimal" required /></div>
        <div class="grid grid-cols-2 gap-3"><BaseInput v-model="form.validityDays" label="Valid for (days)" type="number" min="1" /><div class="flex items-end gap-3 pb-2"><label class="flex items-center gap-2 text-xs font-semibold"><input v-model="form.isMembership" type="checkbox" class="h-4 w-4"> Membership</label><label class="flex items-center gap-2 text-xs font-semibold"><input v-model="form.isActive" type="checkbox" class="h-4 w-4"> Active</label></div></div>
        <div class="flex justify-end gap-2"><BaseButton type="button" variant="ghost" @click="open = false">Cancel</BaseButton><BaseButton type="submit" :loading="saving"><Ticket class="h-4 w-4" /> Save package</BaseButton></div>
      </form>
    </BaseModal>
  </div>
</template>
