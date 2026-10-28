<script setup lang="ts">
import { Clock3, Plus, Scissors, Sparkles, Trash2, Users } from 'lucide-vue-next';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
import type { Service } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Services' });

const toast = useToast();
const { items, categories, loading, load, create, update, remove } = useServices();
const { items: providers, load: loadProviders } = useProviders();
const open = ref(false);
const saving = ref(false);
const editing = ref<Service | null>(null);
const removing = ref<Service | null>(null);
const form = reactive({
  name: '', description: '', category: 'Beauty', imageUrl: '', color: '#FF5A1F',
  durationMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 15,
  price: '', deposit: '', requiresDeposit: false, maxBookingsPerSlot: 1,
  providerIds: [] as string[], isActive: true,
  addOns: [] as { name: string; price: string; durationMinutes: number }[],
});
const activeCount = computed(() => items.value.filter((s) => s.isActive).length);
const avgPrice = computed(() => activeCount.value ? Math.round(items.value.filter((s) => s.isActive).reduce((s, x) => s + x.priceKobo, 0) / activeCount.value) : 0);

function reset() {
  Object.assign(form, {
    name: '', description: '', category: categories.value[0] || 'Beauty', imageUrl: '', color: '#FF5A1F',
    durationMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 15,
    price: '', deposit: '', requiresDeposit: false, maxBookingsPerSlot: 1,
    providerIds: providers.value.slice(0, 1).map((p) => p.id), isActive: true, addOns: [],
  });
  editing.value = null;
}
function openCreate() { reset(); open.value = true; }
function openEdit(service: Service) {
  editing.value = service;
  Object.assign(form, {
    name: service.name, description: service.description, category: service.category,
    imageUrl: service.imageUrl || '', color: service.color, durationMinutes: service.durationMinutes,
    bufferBeforeMinutes: service.bufferBeforeMinutes, bufferAfterMinutes: service.bufferAfterMinutes,
    price: nairaInput(service.priceKobo), deposit: nairaInput(service.depositKobo),
    requiresDeposit: service.requiresDeposit, maxBookingsPerSlot: service.maxBookingsPerSlot,
    providerIds: [...service.providerIds], isActive: service.isActive,
    addOns: service.addOns.map((a) => ({ name: a.name, price: nairaInput(a.priceKobo), durationMinutes: a.durationMinutes })),
  });
  open.value = true;
}
function toggleProvider(id: string) {
  form.providerIds = form.providerIds.includes(id) ? form.providerIds.filter((p) => p !== id) : [...form.providerIds, id];
}
async function save() {
  if (form.name.trim().length < 2) return toast.error('Give the service a name.');
  if (!nairaToKobo(form.price)) return toast.error('Add a price for this service.');
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(), description: form.description.trim(), category: form.category,
      imageUrl: form.imageUrl || null, color: form.color,
      durationMinutes: Number(form.durationMinutes) || 60,
      bufferBeforeMinutes: Number(form.bufferBeforeMinutes) || 0,
      bufferAfterMinutes: Number(form.bufferAfterMinutes) || 0,
      priceKobo: nairaToKobo(form.price), depositKobo: nairaToKobo(form.deposit),
      requiresDeposit: form.requiresDeposit, maxBookingsPerSlot: Number(form.maxBookingsPerSlot) || 1,
      providerIds: form.providerIds, isActive: form.isActive, isPublic: true,
      addOns: form.addOns.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), priceKobo: nairaToKobo(a.price), durationMinutes: Number(a.durationMinutes) || 0 })),
    };
    if (editing.value) await update(editing.value.id, payload as Partial<Service>);
    else await create(payload as Partial<Service>);
    toast.success(editing.value ? 'Service updated.' : 'Service added.');
    open.value = false;
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function hide() {
  if (!removing.value) return;
  try { await remove(removing.value.id); toast.success('Service hidden.'); removing.value = null; }
  catch (error) { toast.error((error as Error).message); }
}
onMounted(async () => { await Promise.all([load(), loadProviders()]); if (!categories.value.length) form.category = 'Beauty'; });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Services" subtitle="Your bookable menu — duration, price, deposit and who delivers it." eyebrow="Service menu">
      <template #actions><BaseButton @click="openCreate"><Plus class="h-4 w-4" /> Add service</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Active services</p><p class="mt-1 font-display text-2xl font-bold">{{ activeCount }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Average price</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(avgPrice) }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Categories</p><p class="mt-1 font-display text-2xl font-bold">{{ categories.length }}</p></div>
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div v-for="i in 3" :key="i" class="skeleton h-56 rounded-3xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="Build your service menu" message="Add what you offer, how long it takes, what it costs and who delivers it. Then publish your booking page." action-label="Add your first service" @action="openCreate">
      <template #icon><Scissors class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="service in items" :key="service.id" class="card overflow-hidden p-0">
        <div class="h-1.5" :style="{ background: service.color }" />
        <div class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">{{ service.category }}</p><h3 class="mt-1 truncate font-display text-xl font-bold">{{ service.name }}</h3></div>
            <BaseBadge :variant="service.isActive ? 'success' : 'neutral'">{{ service.isActive ? 'Bookable' : 'Hidden' }}</BaseBadge>
          </div>
          <p class="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">{{ service.description || 'No description yet.' }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-muted">
            <span class="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-1.5"><Clock3 class="h-3 w-3" /> {{ service.durationMinutes }} min</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-1.5"><Users class="h-3 w-3" /> {{ service.providerIds.length }} team member{{ service.providerIds.length === 1 ? '' : 's' }}</span>
            <span v-if="service.requiresDeposit" class="rounded-full bg-warning/10 px-2.5 py-1.5 text-warning">Deposit {{ formatNaira(service.depositKobo) }}</span>
          </div>
          <div class="mt-4 flex items-end justify-between border-t border-line pt-3">
            <p class="font-display text-xl font-bold">{{ formatNaira(service.priceKobo) }}</p>
            <div class="flex gap-1"><button class="rounded-xl px-2.5 py-2 text-[11px] font-bold text-muted hover:bg-raised" @click="openEdit(service)">Edit</button><button class="rounded-xl px-2.5 py-2 text-[11px] font-bold text-danger hover:bg-danger/5" @click="removing = service">Hide</button></div>
          </div>
        </div>
      </article>
    </div>

    <BaseModal v-model:open="open" :title="editing ? 'Edit service' : 'Add a service'" description="Customers will see this on your booking page." size="lg">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2"><BaseInput v-model="form.name" label="Service name" placeholder="e.g. Knotless braids" required /></div>
          <BaseInput v-model="form.category" label="Category" placeholder="Hair, Nails, Facials…" />
          <BaseInput v-model="form.price" label="Price" prefix="₦" inputmode="decimal" placeholder="15,000" required />
          <BaseInput v-model="form.durationMinutes" label="Duration (minutes)" type="number" min="5" />
          <BaseInput v-model="form.maxBookingsPerSlot" label="People per slot" type="number" min="1" hint="1 for private appointments." />
          <BaseInput v-model="form.bufferBeforeMinutes" label="Buffer before (min)" type="number" min="0" />
          <BaseInput v-model="form.bufferAfterMinutes" label="Buffer after (min)" type="number" min="0" />
        </div>
        <BaseTextarea v-model="form.description" label="Description" placeholder="What is included? Who is it for?" />
        <div>
          <div class="flex items-center justify-between"><p class="label-base mb-0">Add-ons</p><button type="button" class="text-xs font-bold text-brand-600" @click="form.addOns.push({ name: '', price: '', durationMinutes: 0 });">+ Add add-on</button></div>
          <p class="mt-1 text-[10px] text-muted">Optional extras a customer can add while booking.</p>
          <div v-for="(addon, i) in form.addOns" :key="i" class="mt-2 grid grid-cols-[1fr_110px_76px_36px] items-end gap-2">
            <BaseInput v-model="addon.name" label="Add-on" placeholder="Deep conditioning" />
            <BaseInput v-model="addon.price" label="Price" prefix="₦" inputmode="decimal" />
            <BaseInput v-model="addon.durationMinutes" label="Mins" type="number" min="0" />
            <button type="button" class="flex h-11 items-center justify-center rounded-xl text-danger hover:bg-danger/5" aria-label="Remove add-on" @click="form.addOns.splice(i, 1)"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-4 rounded-2xl bg-raised/60 p-4">
          <label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.requiresDeposit" type="checkbox" class="h-4 w-4"> Require deposit</label>
          <BaseInput v-if="form.requiresDeposit" v-model="form.deposit" label="Deposit" prefix="₦" inputmode="decimal" class="max-w-[160px]" />
          <label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.isActive" type="checkbox" class="h-4 w-4"> Bookable</label>
        </div>
        <div>
          <p class="label-base">Who delivers this service?</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="p in providers" :key="p.id" type="button" class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold" :class="form.providerIds.includes(p.id) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-muted'" @click="toggleProvider(p.id)"><span class="h-2.5 w-2.5 rounded-full" :style="{ background: p.color }" /> {{ p.name }}</button>
          </div>
          <p v-if="!providers.length" class="mt-2 text-xs text-muted">Add a team member first on the Team page.</p>
        </div>
        <div class="flex justify-end gap-2"><BaseButton type="button" variant="ghost" @click="open = false">Cancel</BaseButton><BaseButton type="submit" :loading="saving"><Sparkles class="h-4 w-4" /> Save service</BaseButton></div>
      </form>
    </BaseModal>

    <ConfirmDialog :open="!!removing" danger title="Hide this service?" message="It disappears from your booking page. Existing appointments stay intact." confirm-label="Hide service" @update:open="(v) => { if (!v) removing = null; }" @confirm="hide" />
  </div>
</template>
