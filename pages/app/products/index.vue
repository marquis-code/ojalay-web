<script setup lang="ts">
import { AlertTriangle, Boxes, CheckSquare, LayoutGrid, List, Package, Plus, Search, SlidersHorizontal, Square, Trash2 } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { optimizedImage } from '~/utils/cloudinary';
import { titleCase } from '~/utils/entities';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Products' });
const toast = useToast();
const { items, meta, loading, categories, filters, load, loadExtras, remove, removeMany } = useProducts();
const confirmOpen = ref(false);
const confirmMode = ref<'single' | 'batch'>('single');
const deleteTarget = ref<{ id: string; name: string } | null>(null);
const selectedIds = ref<string[]>([]);
const viewMode = ref<'grid' | 'list'>('grid');
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filters.search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => load(), 300); });
watch(() => [filters.category, filters.status], () => load());
const allSelected = computed(() => items.value.length > 0 && items.value.every((product) => selectedIds.value.includes(product.id)));
function toggleSelect(id: string) { selectedIds.value = selectedIds.value.includes(id) ? selectedIds.value.filter((value) => value !== id) : [...selectedIds.value, id]; }
function toggleAll() { selectedIds.value = allSelected.value ? [] : items.value.map((product) => product.id); }
function askDelete(product: { id: string; name: string }) { confirmMode.value = 'single'; deleteTarget.value = { id: product.id, name: product.name }; confirmOpen.value = true; }
function askBatchDelete() { if (!selectedIds.value.length) return; confirmMode.value = 'batch'; deleteTarget.value = null; confirmOpen.value = true; }
async function confirmDelete() {
  try {
    if (confirmMode.value === 'batch') { const count = selectedIds.value.length; await removeMany(selectedIds.value); toast.success(`${count} product${count === 1 ? '' : 's'} deleted.`); selectedIds.value = []; }
    else if (deleteTarget.value) { await remove(deleteTarget.value.id); toast.success(`${deleteTarget.value.name} deleted.`); selectedIds.value = selectedIds.value.filter((id) => id !== deleteTarget.value?.id); }
    confirmOpen.value = false; deleteTarget.value = null;
  } catch (error) { toast.error((error as Error).message); }
}
function setView(mode: 'grid' | 'list') { viewMode.value = mode; localStorage.setItem('ojaly.products.view', mode); }
onMounted(async () => { const saved = localStorage.getItem('ojaly.products.view'); if (saved === 'list' || saved === 'grid') viewMode.value = saved; await Promise.all([load(), loadExtras()]); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Products" subtitle="Everything you sell, with the real cost and stock in one place." eyebrow="Catalog">
      <template #actions><BaseButton to="/app/products/new"><Plus class="h-4 w-4" /> Add product</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Products</p><p class="mt-1 font-display text-2xl font-bold">{{ meta.total }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Low stock</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ items.filter((p) => p.stockStatus !== 'healthy').length }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Stock value</p><p class="mt-1 font-display text-2xl font-bold">{{ formatNaira(items.reduce((s, p) => s + p.quantity * p.costPriceKobo, 0)) }}</p></div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="filters.search" type="search" placeholder="Search products or SKU…" class="input-base pl-11" aria-label="Search products">
      </div>
      <BaseSelect v-model="filters.category" :options="[{ value: 'all', label: 'All categories' }, ...categories.map((cat) => ({ value: cat, label: cat }))]" aria-label="Filter by category" class="!w-48" />
      <BaseSelect v-model="filters.status" :options="[{ value: 'all', label: 'All stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }, { value: 'inactive', label: 'Hidden' }]" aria-label="Filter by stock" class="!w-40" />
      <div class="flex items-center gap-1 rounded-xl border border-line bg-surface p-1"><button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg" :class="viewMode === 'grid' ? 'bg-ink text-canvas' : 'text-muted hover:bg-raised'" aria-label="Grid view" @click="setView('grid')"><LayoutGrid class="h-4 w-4" /></button><button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg" :class="viewMode === 'list' ? 'bg-ink text-canvas' : 'text-muted hover:bg-raised'" aria-label="List view" @click="setView('list')"><List class="h-4 w-4" /></button></div>
    </div>
    <div v-if="selectedIds.length" class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-danger/20 bg-danger/5 p-3"><p class="text-xs font-bold text-danger">{{ selectedIds.length }} selected</p><div class="flex gap-2"><button type="button" class="rounded-lg border border-line bg-surface px-3 py-1.5 text-[10px] font-bold" @click="selectedIds = []">Clear</button><button type="button" class="inline-flex items-center gap-1 rounded-lg bg-danger px-3 py-1.5 text-[10px] font-bold text-white" @click="askBatchDelete"><Trash2 class="h-3.5 w-3.5" /> Delete selected</button></div></div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div v-for="i in 6" :key="i" class="skeleton h-56 rounded-3xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No products yet" message="Add what you sell once. It powers your stock, sales, receipts and free website." action-label="Add your first product" @action="navigateTo('/app/products/new')">
      <template #icon><Package class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else-if="viewMode === 'grid'" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="product in items" :key="product.id" class="group card overflow-hidden p-0 transition hover:shadow-lift">
        <div class="relative">
          <button type="button" class="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-forest-900 shadow-sm" :aria-label="`Select ${product.name}`" @click.stop="toggleSelect(product.id)"><CheckSquare v-if="selectedIds.includes(product.id)" class="h-4 w-4 text-brand-600" /><Square v-else class="h-4 w-4" /></button>
          <NuxtLink :to="`/app/products/${product.id}`" class="block">
            <div class="relative aspect-[4/3] overflow-hidden bg-raised">
              <img v-if="product.images[0]" :src="optimizedImage(product.images[0], 500)" :alt="product.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
              <div v-else class="flex h-full items-center justify-center"><Package class="h-10 w-10 text-muted/30" /></div>
              <div class="absolute left-3 top-12 flex gap-1.5">
                <BaseBadge v-if="!product.isActive" variant="neutral">Hidden</BaseBadge>
                <BaseBadge v-if="product.stockStatus === 'out'" variant="danger" dot>Out of stock</BaseBadge>
                <BaseBadge v-else-if="product.stockStatus === 'low'" variant="warning" dot>Low stock</BaseBadge>
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="truncate font-bold">{{ product.name }}</p><p class="text-[11px] text-muted">{{ titleCase(product.category) }} · {{ product.variantCount }} variant{{ product.variantCount === 1 ? '' : 's' }}</p></div><p class="shrink-0 font-display text-lg font-bold">{{ formatNaira(product.priceKobo) }}</p></div>
              <div class="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px]"><span :class="product.quantity <= 0 ? 'font-bold text-danger' : product.stockStatus === 'low' ? 'font-bold text-warning' : 'text-muted'">{{ product.quantity }} in stock</span><span class="text-muted">Cost {{ formatNaira(product.costPriceKobo) }}</span></div>
            </div>
          </NuxtLink>
        </div>
        <div class="flex gap-1 border-t border-line p-2"><NuxtLink :to="`/app/stock?product=${product.id}`" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised hover:text-ink"><Boxes class="h-3.5 w-3.5" /> Stock</NuxtLink><NuxtLink :to="`/app/products/${product.id}`" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised hover:text-ink"><SlidersHorizontal class="h-3.5 w-3.5" /> Edit</NuxtLink><button type="button" class="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold text-danger hover:bg-danger/5" @click="askDelete(product)"><Trash2 class="h-3.5 w-3.5" /> Delete</button></div>
      </div>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="hidden grid-cols-[auto_1fr_120px_100px_110px_130px] items-center gap-3 border-b border-line bg-raised/40 px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted md:grid">
        <button type="button" class="flex h-5 w-5 items-center justify-center" :aria-label="allSelected ? 'Clear selection' : 'Select all products'" @click="toggleAll"><CheckSquare v-if="allSelected" class="h-4 w-4 text-brand-600" /><Square v-else class="h-4 w-4" /></button><span>Product</span><span class="text-right">Price</span><span class="text-right">Stock</span><span>Status</span><span class="text-right">Actions</span>
      </div>
      <div v-for="product in items" :key="product.id" class="grid grid-cols-[auto_1fr] items-center gap-3 border-b border-line p-4 last:border-0 md:grid-cols-[auto_1fr_120px_100px_110px_130px]">
        <button type="button" class="flex h-5 w-5 items-center justify-center" :aria-label="selectedIds.includes(product.id) ? 'Deselect' : 'Select product'" @click="toggleSelect(product.id)"><CheckSquare v-if="selectedIds.includes(product.id)" class="h-4 w-4 text-brand-600" /><Square v-else class="h-4 w-4 text-muted" /></button>
        <NuxtLink :to="`/app/products/${product.id}`" class="flex min-w-0 items-center gap-3"><div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-raised"><img v-if="product.images[0]" :src="optimizedImage(product.images[0], 100)" :alt="product.name" class="h-full w-full object-cover"><Package v-else class="m-auto h-5 w-5 text-muted" /></div><div class="min-w-0"><p class="truncate text-sm font-bold">{{ product.name }}</p><p class="truncate text-[10px] text-muted">{{ titleCase(product.category) }} · {{ product.variantCount }} variant{{ product.variantCount === 1 ? '' : 's' }}</p></div></NuxtLink>
        <p class="hidden text-right text-xs font-bold md:block">{{ formatNaira(product.priceKobo) }}</p>
        <p class="hidden text-right text-xs md:block" :class="product.quantity <= 0 ? 'font-bold text-danger' : product.stockStatus === 'low' ? 'font-bold text-warning' : 'text-muted'">{{ product.quantity }}</p>
        <div class="hidden md:block"><BaseBadge v-if="!product.isActive" variant="neutral">Hidden</BaseBadge><BaseBadge v-else-if="product.stockStatus === 'out'" variant="danger" dot>Out</BaseBadge><BaseBadge v-else-if="product.stockStatus === 'low'" variant="warning" dot>Low</BaseBadge><BaseBadge v-else variant="success" dot>Healthy</BaseBadge></div>
        <div class="col-span-2 flex items-center justify-end gap-1 md:col-span-1"><NuxtLink :to="`/app/stock?product=${product.id}`" class="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-raised" aria-label="Stock"><Boxes class="h-3.5 w-3.5" /></NuxtLink><NuxtLink :to="`/app/products/${product.id}`" class="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-raised" aria-label="Edit"><SlidersHorizontal class="h-3.5 w-3.5" /></NuxtLink><button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/5" aria-label="Delete product" @click="askDelete(product)"><Trash2 class="h-3.5 w-3.5" /></button></div>
      </div>
    </div>

    <div v-if="meta.pages > 1" class="flex justify-center gap-2">
      <BaseButton variant="outline" size="sm" :disabled="filters.page <= 1" @click="filters.page--; load()">Previous</BaseButton>
      <span class="flex items-center px-3 text-xs text-muted">Page {{ filters.page }} of {{ meta.pages }}</span>
      <BaseButton variant="outline" size="sm" :disabled="filters.page >= meta.pages" @click="filters.page++; load()">Next</BaseButton>
    </div>

    <ConfirmDialog v-model:open="confirmOpen" danger :title="confirmMode === 'batch' ? `Delete ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'}?` : `Delete ${deleteTarget?.name || 'this product'}?`" :message="confirmMode === 'batch' ? 'This permanently removes the selected products, their variants and their stock history. Sales records keep their item snapshots.' : 'This permanently removes the product, its variants and its stock history. Sales records keep their item snapshots.'" confirm-label="Delete permanently" @confirm="confirmDelete" />
  </div>
</template>
