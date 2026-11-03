<script setup lang="ts">
import { ArrowLeft, Banknote, CalendarDays, CheckCircle2, Clock3, UserRoundCog } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Team performance' });
const route = useRoute();
const toast = useToast();
const providers = useProviders();
const bookings = useBookings();
const provider = computed(() => providers.items.value.find((item) => item.id === String(route.params.id)));
const loading = computed(() => providers.loading.value || bookings.loading.value);
async function load() {
  await providers.load();
  bookings.filters.providerId = String(route.params.id);
  bookings.filters.date = '';
  bookings.filters.status = 'all';
  await bookings.load();
}
function date(value: string) { return new Date(value).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
onMounted(() => { load().catch((error) => toast.error((error as Error).message)); });
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/app/team" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to team</NuxtLink>
    <div v-if="loading" class="skeleton h-48 rounded-3xl" />
    <template v-else-if="provider">
      <div class="card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3"><div class="flex items-center gap-3"><div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-lg font-bold text-white" :style="{ background: provider.color }"><img v-if="provider.avatarUrl" :src="provider.avatarUrl" :alt="provider.name" class="h-full w-full object-cover"><span v-else>{{ provider.name.slice(0, 1) }}</span></div><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Team performance</p><h1 class="font-display text-2xl font-bold">{{ provider.name }}</h1><p class="text-xs text-muted">{{ provider.title || 'Team member' }}</p></div></div><BaseBadge :variant="provider.isActive ? 'success' : 'neutral'">{{ provider.isActive ? 'Active' : 'Hidden' }}</BaseBadge></div>
      </div>
      <div class="grid gap-3 sm:grid-cols-4"><div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Completed</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ provider.completedBookings || 0 }}</p></div><div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Assigned</p><p class="mt-1 font-display text-2xl font-bold">{{ provider.assignedBookings || 0 }}</p></div><div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Completion</p><p class="mt-1 font-display text-2xl font-bold">{{ provider.completionRate || 0 }}%</p></div><div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Salary</p><p class="mt-1 font-display text-2xl font-bold">{{ provider.salaryEnabled ? `${formatNaira(provider.payRateKobo || provider.monthlySalaryKobo || 0)} / ${provider.payFrequency === 'per_service' ? 'service' : provider.payFrequency || 'month'}` : '—' }}</p></div></div>
      <div class="card p-5"><div class="flex items-center justify-between"><div><h2 class="font-display text-lg font-bold">Assigned services</h2><p class="mt-1 text-xs text-muted">Jobs this team member has picked up or been assigned.</p></div><CalendarDays class="h-5 w-5 text-brand-600" /></div>
        <div v-if="bookings.items.value.length" class="mt-4 divide-y divide-line"><div v-for="booking in bookings.items.value" :key="booking.id" class="flex flex-wrap items-center justify-between gap-2 py-3"><div><p class="text-sm font-bold">{{ booking.serviceName }}</p><p class="text-[10px] text-muted">{{ booking.customerName }} · {{ date(booking.startAt) }}</p></div><div class="text-right"><BaseBadge :variant="booking.status === 'completed' ? 'success' : booking.status === 'cancelled' || booking.status === 'no_show' ? 'danger' : 'warning'">{{ booking.status.replace('_', ' ') }}</BaseBadge><p class="mt-1 text-[10px] text-muted">{{ formatNaira(booking.priceKobo) }}</p></div></div></div>
        <p v-else class="mt-4 rounded-xl border border-dashed p-5 text-center text-xs text-muted">No assigned services yet.</p>
      </div>
      <div class="card p-5"><div class="flex items-center gap-2"><Banknote class="h-4 w-4 text-brand-600" /><h2 class="font-display text-lg font-bold">Payroll profile</h2></div><div class="mt-3 grid gap-2 text-xs sm:grid-cols-2"><p class="flex justify-between rounded-xl bg-raised/50 p-3"><span class="text-muted">Monthly salary</span><strong>{{ provider.salaryEnabled ? formatNaira(provider.monthlySalaryKobo || 0) : 'Not salaried' }}</strong></p><p class="flex justify-between rounded-xl bg-raised/50 p-3"><span class="text-muted">Bank</span><strong>{{ provider.bankName || 'Not added' }} {{ provider.bankAccountLast4 ? `•••• ${provider.bankAccountLast4}` : '' }}</strong></p></div><NuxtLink to="/app/payroll" class="mt-3 inline-flex text-xs font-bold text-brand-600">Open payroll →</NuxtLink></div>
    </template>
    <div v-else class="card p-8 text-center"><UserRoundCog class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">Team member not found</p><NuxtLink to="/app/team" class="mt-3 inline-flex text-xs font-bold text-brand-600">Back to team</NuxtLink></div>
  </div>
</template>
