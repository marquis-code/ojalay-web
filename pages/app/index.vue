<script setup lang="ts">
import { ArrowRight, ArrowUpRight, Boxes, CalendarDays, CalendarRange, Download, FileSpreadsheet, PackageOpen, Plus, QrCode, Scissors, ShoppingBag, TrendingUp, Users, Wallet } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate, greeting } from '~/utils/date';
import { titleCase } from '~/utils/entities';
import { optimizedImage } from '~/utils/cloudinary';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Dashboard' });
const auth = useAuthStore();
const businessStore = useBusinessStore();
const toast = useToast();
const dashboard = useDashboard();
const appointments = useBookings();
const isServiceMode = computed(() => ['services', 'hybrid'].includes(businessStore.business?.businessMode || ''));
const primaryAction = computed(() => isServiceMode.value ? { to: '/app/bookings/new', label: 'New booking' } : { to: '/app/sales/new', label: 'Record sale' });
const { onboarding, markProfitSeen } = useOnboarding();
const products = useProducts();
const customOpen = ref(false);
const exportOpen = ref(false);
const ranges = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'custom', label: 'Custom' },
];
const todayLabel = computed(() => formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' }));
const summary = computed(() => dashboard.data.value?.summary);
const capabilities = computed(() => dashboard.data.value?.capabilities);

async function loadAll() {
  await dashboard.load(dashboard.range.value);
  if (dashboard.data.value?.summary.salesCount) await markProfitSeen();
  if (businessStore.business?.businessMode !== 'services') await products.loadExtras();
  if (isServiceMode.value) await Promise.all([appointments.load(), appointments.loadMetrics(dashboard.range.value)]);
}
async function chooseRange(key: string) {
  if (key === 'custom') { customOpen.value = true; return; }
  await dashboard.load(key);
  if (isServiceMode.value) await appointments.loadMetrics(key);
}
async function applyCustom() {
  if (!dashboard.customFrom.value || !dashboard.customTo.value) { toast.error('Choose both dates.'); return; }
  customOpen.value = false;
  await dashboard.load('custom');
  if (isServiceMode.value) await appointments.loadMetrics('custom', dashboard.customFrom.value, dashboard.customTo.value);
}
async function exportFile(kind: 'csv' | 'pdf') {
  if (kind === 'csv' && !capabilities.value?.csvExport) { toast.warning('CSV export is on the Hustle plan. Upgrade to unlock it.', 'Plan feature'); return; }
  if (kind === 'pdf' && !capabilities.value?.pdfExport) { toast.warning('PDF export is on the Hustle plan. Upgrade to unlock it.', 'Plan feature'); return; }
  exportOpen.value = false;
  try {
    if (kind === 'csv') await dashboard.exportCsv(); else await dashboard.exportPdf();
    toast.success(`Your ${kind.toUpperCase()} report is downloading.`);
  } catch (error) { toast.error((error as Error).message); }
}
const topProduct = computed(() => dashboard.data.value?.bestSellers[0] || null);
onMounted(loadAll);
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">{{ todayLabel }}</p>
        <h1 class="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{{ greeting() }}, {{ auth.displayName }}.</h1>
        <p class="mt-1 text-sm text-muted">{{ isServiceMode ? 'Bookings, revenue and the records behind them.' : 'Here’s the truth about your business.' }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <BaseButton variant="outline" size="md" @click="exportOpen = !exportOpen"><Download class="h-4 w-4" /> Export</BaseButton>
          <div v-if="exportOpen" class="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-line bg-surface p-2 shadow-lift">
            <button class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-raised" @click="exportFile('csv')"><FileSpreadsheet class="h-4 w-4 text-success" /> CSV report</button>
            <button class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-raised" @click="exportFile('pdf')"><Download class="h-4 w-4 text-brand-500" /> PDF report</button>
          </div>
        </div>
        <BaseButton :to="primaryAction.to" size="md"><Plus class="h-4 w-4" /> {{ primaryAction.label }}</BaseButton>
      </div>
    </div>

    <OnboardingChecklist :onboarding="onboarding" />

    <div class="scrollbar-none flex gap-1.5 overflow-x-auto">
      <button v-for="range in ranges" :key="range.key" type="button" class="shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition" :class="dashboard.range.value === range.key ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted hover:text-ink'" @click="chooseRange(range.key)">
        <CalendarRange v-if="range.key === 'custom'" class="mr-1 inline h-3.5 w-3.5" />{{ range.label }}
      </button>
    </div>

    <div v-if="dashboard.loading.value && !dashboard.data.value" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="i in 4" :key="i" class="skeleton h-36 rounded-3xl" />
    </div>
    <div v-else-if="dashboard.error.value" class="card p-6">
      <p class="font-display text-xl font-bold">We couldn't load your numbers</p>
      <p class="mt-1 text-sm text-muted">{{ dashboard.error.value }}</p>
      <BaseButton size="sm" class="mt-4" @click="loadAll">Try again</BaseButton>
    </div>
    <template v-else-if="summary">
      <div v-if="isServiceMode" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="dashboard-stats">
        <StatCard label="Bookings" :value="appointments.metrics.value?.summary.bookings || 0" format="number" tone="accent" :hint="`${appointments.metrics.value?.summary.completed || 0} completed · ${appointments.metrics.value?.summary.pending || 0} pending`">
          <NuxtLink to="/app/bookings" class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-forest-900">Open calendar <ArrowUpRight class="h-3 w-3" /></NuxtLink>
        </StatCard>
        <StatCard label="Service revenue" :value="appointments.metrics.value?.summary.revenueKobo || 0" :hint="`${appointments.metrics.value?.summary.completed || 0} completed bookings`" />
        <StatCard label="Collected online" :value="appointments.metrics.value?.summary.collectedKobo || 0" tone="dark" :hint="`${appointments.metrics.value?.summary.marketplaceBookings || 0} marketplace booking${appointments.metrics.value?.summary.marketplaceBookings === 1 ? '' : 's'}`">
          <NuxtLink to="/app/bookings" class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-accent">Payments <ArrowUpRight class="h-3 w-3" /></NuxtLink>
        </StatCard>
        <StatCard label="Appointments today" :value="appointments.summary.today" format="number" :hint="`${appointments.summary.upcoming} upcoming · ${appointments.summary.pending} to confirm`">
          <NuxtLink to="/app/bookings" class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600">View schedule <ArrowUpRight class="h-3 w-3" /></NuxtLink>
        </StatCard>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="dashboard-stats">
        <StatCard label="Revenue" :value="summary.revenueKobo" :change="summary.comparison.revenuePercent" :hint="`${summary.salesCount} sale${summary.salesCount === 1 ? '' : 's'} · ${dashboard.data.value?.range.label}`" />
        <StatCard label="Net profit" :value="summary.profitKobo" :change="summary.comparison.profitPercent" :hint="`${summary.profitMargin}% margin after expenses`" />
        <StatCard label="Money owed to you" :value="dashboard.data.value?.debts.outstandingKobo" format="money" tone="dark" :hint="`${dashboard.data.value?.debts.count || 0} customer${dashboard.data.value?.debts.count === 1 ? '' : 's'} · ${formatNaira(dashboard.data.value?.debts.overdueKobo)} overdue`">
          <NuxtLink to="/app/debts" class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-accent">Chase it <ArrowUpRight class="h-3 w-3" /></NuxtLink>
        </StatCard>
        <StatCard label="Stock value" :value="dashboard.data.value?.stock.costValueKobo" tone="accent" :hint="`${dashboard.data.value?.stock.units || 0} units · ${dashboard.data.value?.stock.lowStock || 0} low`">
          <NuxtLink to="/app/stock" class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-forest-900">Manage stock <ArrowUpRight class="h-3 w-3" /></NuxtLink>
        </StatCard>
      </div>

      <InsightBanner :insights="dashboard.data.value?.insights || []" />

      <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <BaseCard>
          <div class="mb-1 flex flex-wrap items-start justify-between gap-2">
            <div><h2 class="font-display text-xl font-bold">{{ isServiceMode ? 'Completed service revenue' : 'Money in, profit out' }}</h2><p class="text-[11px] text-muted">{{ isServiceMode ? 'Revenue and profit from completed bookings' : 'Revenue and gross profit' }} · {{ dashboard.data.value?.range.human }}</p></div>
            <BaseBadge variant="neutral">{{ formatNaira(summary.grossProfitKobo) }} gross profit</BaseBadge>
          </div>
          <RevenueChart :data="dashboard.data.value?.chart || []" :loading="dashboard.loading.value" />
        </BaseCard>

        <div class="space-y-4">
          <BaseCard v-if="isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Today’s appointments</h2><NuxtLink to="/app/bookings" class="text-[10px] font-bold text-brand-600">See all</NuxtLink></div>
            <div v-if="appointments.items.value.length" class="mt-3 space-y-2">
              <NuxtLink v-for="b in appointments.items.value.slice(0, 3)" :key="b.id" to="/app/bookings" class="flex items-center gap-2 rounded-xl p-2 hover:bg-raised">
                <div class="w-12 text-center"><p class="text-xs font-bold">{{ new Date(b.startAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) }}</p></div>
                <div class="h-8 w-0.5 rounded-full" :style="{ background: b.providerColor || '#FF5A1F' }" />
                <div class="min-w-0"><p class="truncate text-xs font-bold">{{ b.customerName }}</p><p class="truncate text-[10px] text-muted">{{ b.serviceName }}</p></div>
              </NuxtLink>
            </div>
            <p v-else class="mt-4 text-xs text-muted">No appointments today. Share your booking link and fill the day.</p>
            <NuxtLink to="/app/services" class="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-brand-600">Manage service menu <ArrowRight class="h-3 w-3" /></NuxtLink>
          </BaseCard>
          <BaseCard v-if="!isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Best seller</h2><TrendingUp class="h-4 w-4 text-success" /></div>
            <div v-if="topProduct" class="mt-4 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-forest-900">{{ topProduct.name[0] }}</div>
              <div class="min-w-0"><p class="truncate text-sm font-bold">{{ topProduct.name }}</p><p class="text-[11px] text-muted">{{ topProduct.quantity }} sold · {{ formatNaira(topProduct.revenueKobo) }}</p></div>
            </div>
            <div v-else class="mt-4 text-xs text-muted">No best seller yet. Record a sale to find out what customers love.</div>
            <div v-if="products.lowStock.value.length" class="mt-4 border-t border-line pt-3">
              <p class="text-[10px] font-bold uppercase tracking-wider text-warning">Restock soon</p>
              <NuxtLink v-for="item in products.lowStock.value.slice(0, 2)" :key="item.variantId" to="/app/stock" class="mt-2 flex items-center justify-between gap-2 text-xs">
                <span class="truncate font-semibold">{{ item.name }}</span><span class="shrink-0 text-warning">{{ item.quantity <= 0 ? 'Out' : `${item.quantity} left` }}</span>
              </NuxtLink>
            </div>
            <NuxtLink to="/app/stock" class="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-300">Stock page <ArrowRight class="h-3 w-3" /></NuxtLink>
          </BaseCard>
          <BaseCard v-if="isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Top services</h2><Scissors class="h-4 w-4 text-brand-600" /></div>
            <div v-if="appointments.metrics.value?.topServices.length" class="mt-3 space-y-2">
              <div v-for="service in appointments.metrics.value.topServices.slice(0, 4)" :key="service.name" class="flex items-center justify-between gap-3 rounded-xl bg-raised/50 px-2.5 py-2">
                <div class="min-w-0"><p class="truncate text-xs font-bold">{{ service.name }}</p><p class="text-[10px] text-muted">{{ service.bookings }} completed booking{{ service.bookings === 1 ? '' : 's' }}</p></div>
                <p class="shrink-0 text-xs font-bold text-brand-600">{{ formatNaira(service.revenueKobo) }}</p>
              </div>
            </div>
            <p v-else class="mt-3 text-xs text-muted">Your top services will appear after the first completed booking.</p>
            <NuxtLink to="/app/services" class="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-brand-600">Manage service menu <ArrowRight class="h-3 w-3" /></NuxtLink>
          </BaseCard>
          <BaseCard v-if="!isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">This period</h2><Boxes class="h-4 w-4 text-muted" /></div>
            <dl class="mt-4 space-y-2.5 text-xs">
              <div class="flex justify-between"><dt class="text-muted">Cost of goods</dt><dd class="font-semibold">{{ formatNaira(summary.cogsKobo) }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">Expenses</dt><dd class="font-semibold">{{ formatNaira(summary.expensesKobo) }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">New customers</dt><dd class="font-semibold">{{ dashboard.data.value?.customers.new }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">Sales</dt><dd class="font-semibold">{{ summary.salesCount }}</dd></div>
            </dl>
            <div class="mt-4 flex gap-2">
              <NuxtLink to="/app/expenses" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><Wallet class="h-4 w-4" /> Expense</NuxtLink>
              <NuxtLink to="/app/customers" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><Users class="h-4 w-4" /> Customer</NuxtLink>
              <NuxtLink to="/app/orders/new" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><ShoppingBag class="h-4 w-4" /> Order</NuxtLink>
            </div>
          </BaseCard>
          <BaseCard v-if="isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Service operations</h2><Boxes class="h-4 w-4 text-muted" /></div>
            <dl class="mt-4 space-y-2.5 text-xs">
              <div class="flex justify-between"><dt class="text-muted">Completed</dt><dd class="font-semibold">{{ appointments.metrics.value?.summary.completed || 0 }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">Pending</dt><dd class="font-semibold">{{ appointments.metrics.value?.summary.pending || 0 }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">No-show rate</dt><dd class="font-semibold">{{ appointments.metrics.value?.summary.noShowRate || 0 }}%</dd></div>
              <div class="flex justify-between"><dt class="text-muted">Repeat customers</dt><dd class="font-semibold">{{ appointments.metrics.value?.summary.repeatCustomers || 0 }}</dd></div>
            </dl>
            <div class="mt-4 flex gap-2">
              <NuxtLink to="/app/bookings/new" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><CalendarDays class="h-4 w-4" /> Booking</NuxtLink>
              <NuxtLink to="/app/services" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><Scissors class="h-4 w-4" /> Services</NuxtLink>
              <NuxtLink to="/app/share" class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-raised/50 px-2 py-2.5 text-[10px] font-bold hover:border-ink"><QrCode class="h-4 w-4" /> Share</NuxtLink>
            </div>
          </BaseCard>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <RecentSales v-if="!isServiceMode" :sales="dashboard.data.value?.recentSales || []" />
        <BaseCard v-else>
          <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Recent bookings</h2><NuxtLink to="/app/bookings" class="text-[10px] font-bold text-brand-600">See all</NuxtLink></div>
          <div v-if="appointments.metrics.value?.recentBookings.length" class="mt-3 divide-y divide-line">
            <NuxtLink v-for="booking in appointments.metrics.value.recentBookings" :key="booking.id" to="/app/bookings" class="flex items-center justify-between gap-2 py-2.5 text-xs hover:bg-raised/40">
              <div class="min-w-0"><p class="truncate font-bold">{{ booking.customerName }} · {{ booking.serviceName }}</p><p class="text-[10px] text-muted">{{ formatDate(booking.startAt) }} · {{ booking.bookingNumber }}</p></div>
              <div class="text-right"><p class="font-bold">{{ formatNaira(booking.priceKobo) }}</p><p class="text-[9px] capitalize text-muted">{{ booking.status.replace('_', ' ') }}</p></div>
            </NuxtLink>
          </div>
          <p v-else class="mt-4 text-xs text-muted">No bookings in this period yet. Share your booking link to fill the calendar.</p>
        </BaseCard>
        <div class="space-y-4">
          <BaseCard v-if="!isServiceMode">
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Slow movers</h2><PackageOpen class="h-4 w-4 text-muted" /></div>
            <p class="mt-0.5 text-[11px] text-muted">Stock that hasn't moved in 30 days.</p>
            <div v-if="dashboard.data.value?.slowMovers.length" class="mt-3 space-y-2">
              <div v-for="item in dashboard.data.value?.slowMovers.slice(0, 4)" :key="item.productId" class="flex items-center gap-2.5">
                <div class="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-raised">
                  <img v-if="item.imageUrl" :src="optimizedImage(item.imageUrl, 80)" :alt="item.name" class="h-full w-full object-cover"><span v-else class="flex h-full w-full items-center justify-center text-[10px] font-bold">{{ item.name[0] }}</span>
                </div>
                <span class="min-w-0 flex-1 truncate text-xs font-semibold">{{ item.name }}</span>
                <span class="shrink-0 text-[10px] text-muted">{{ item.unitsSold }} sold · {{ item.stock }} left</span>
              </div>
            </div>
            <p v-else class="mt-3 text-xs text-muted">No products yet. Add a product to get started.</p>
          </BaseCard>
          <div v-if="isServiceMode" class="rounded-3xl border border-line bg-gradient-to-br from-forest-900 to-forest-800 p-5 text-white">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8C0B4]">Marketplace demand</p>
            <p class="mt-1.5 font-display text-xl font-bold">{{ appointments.metrics.value?.summary.marketplaceBookings || 0 }} Ojaly-sourced bookings</p>
            <p class="mt-1 text-xs leading-relaxed text-[#C7D8CE]">{{ formatNaira(appointments.metrics.value?.summary.marketplaceRevenueKobo || 0) }} completed revenue · {{ formatNaira(appointments.metrics.value?.summary.collectedKobo || 0) }} collected online.</p>
            <NuxtLink to="/app/marketplace" class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400">Open marketplace <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
          </div>
          <div class="rounded-3xl border border-line bg-gradient-to-br from-forest-900 to-forest-800 p-5 text-white">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8C0B4]">Share your numbers</p>
            <p class="mt-1.5 font-display text-xl font-bold">Send a branded report</p>
            <p class="mt-1 text-xs leading-relaxed text-[#C7D8CE]">Export a clean PDF for a partner, parent or investor. It carries your business name, not ours.</p>
            <NuxtLink to="/app/reports" class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400">Open reports <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <BaseModal v-model:open="customOpen" title="Choose a custom range" description="Pick the start and end date for your report.">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseDatePicker v-model="dashboard.customFrom.value" label="From" />
        <BaseDatePicker v-model="dashboard.customTo.value" label="To" />
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <BaseButton variant="ghost" @click="customOpen = false">Cancel</BaseButton>
        <BaseButton @click="applyCustom">Apply range</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
