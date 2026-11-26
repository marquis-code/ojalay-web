<script setup lang="ts">
import { ArrowDownToLine, Banknote, CheckCircle2, Clock3 } from 'lucide-vue-next';
import { payoutsApi, type PayoutSummary } from '~/api/factories/payoutsApi';
import { formatNaira, nairaToKobo } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Earnings & withdrawals' });
const toast = useToast();
const summary = ref<PayoutSummary | null>(null);
const loading = ref(false);
const saving = ref(false);
const amount = ref('');
const note = ref('');
async function load() { loading.value = true; try { summary.value = await payoutsApi.summary(); } catch (error) { toast.error((error as Error).message); } finally { loading.value = false; } }
async function request() {
  const kobo = nairaToKobo(amount.value);
  if (!kobo) return toast.error('Enter an amount to withdraw.');
  saving.value = true;
  try { await payoutsApi.requestWithdrawal({ amountKobo: kobo, note: note.value }); toast.success('Withdrawal requested. Ojaly will review it.'); amount.value = ''; note.value = ''; await load(); }
  catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Earnings & withdrawals" subtitle="Withdraw the money you have earned from completed, paid bookings." eyebrow="Money & people">
      <template #actions><BaseButton to="/app/bookings/all" variant="outline">View bookings</BaseButton></template>
    </PageHeader>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted"><Banknote class="h-4 w-4" /> Available to withdraw</div><p class="mt-2 font-display text-2xl font-bold">{{ formatNaira(summary?.availableKobo || 0) }}</p><p class="mt-1 text-[10px] text-muted">From {{ summary?.completedBookings || 0 }} completed booking{{ summary?.completedBookings === 1 ? '' : 's' }}</p></div>
      <div class="card p-4"><div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted"><Clock3 class="h-4 w-4" /> Being processed</div><p class="mt-2 font-display text-2xl font-bold">{{ formatNaira(summary?.pendingKobo || 0) }}</p><p class="mt-1 text-[10px] text-muted">Pending or approved requests</p></div>
      <div class="card p-4"><div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted"><CheckCircle2 class="h-4 w-4" /> Paid out</div><p class="mt-2 font-display text-2xl font-bold">{{ formatNaira(summary?.paidKobo || 0) }}</p><p class="mt-1 text-[10px] text-muted">Total withdrawn to your bank</p></div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div class="card p-5">
        <div class="flex items-center gap-2"><ArrowDownToLine class="h-5 w-5 text-brand-600" /><h2 class="font-display text-lg font-bold">Request a withdrawal</h2></div>
        <div class="mt-4 rounded-xl border border-line bg-raised/40 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Settlement account</p><template v-if="summary?.settlementAccount"><p class="mt-1 text-xs font-bold">{{ summary.settlementAccount.bankName }} · {{ summary.settlementAccount.accountNumber }}</p><p class="text-[10px] text-muted">{{ summary.settlementAccount.accountName }}</p></template><p v-else class="mt-1 text-xs font-semibold text-warning">No settlement account saved.</p><NuxtLink to="/app/settings/payments" class="mt-2 inline-block text-[10px] font-bold text-brand-600">Manage settlement account →</NuxtLink></div>
        <div class="mt-4 space-y-3"><BaseInput v-model="amount" label="Amount (₦)" prefix="₦" inputmode="decimal" :hint="`Available: ${formatNaira(summary?.availableKobo || 0)}`" /><BaseInput v-model="note" label="Note (optional)" placeholder="Anything we should know" /><BaseButton class="w-full" :loading="saving" :disabled="!summary?.availableKobo" @click="request">Request withdrawal</BaseButton></div>
      </div>
      <div class="card p-5">
        <h2 class="font-display text-lg font-bold">Withdrawal history</h2>
        <div v-if="summary?.requests.length" class="mt-3 divide-y divide-line">
          <div v-for="request in summary.requests" :key="request.id" class="flex items-center justify-between gap-3 py-3">
            <div class="min-w-0"><p class="text-xs font-bold">{{ formatNaira(request.amountKobo) }}</p><p class="text-[10px] text-muted">{{ new Date(request.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) }} · {{ request.bankName }} {{ request.accountNumber.slice(-4) }}</p><p v-if="request.adminNote" class="mt-1 text-[10px] text-muted">{{ request.adminNote }}</p></div>
            <span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold capitalize" :class="request.status === 'paid' ? 'bg-success/10 text-success' : request.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'">{{ request.status }}</span>
          </div>
        </div>
        <div v-else class="mt-4 rounded-xl bg-raised/40 p-6 text-center"><p class="text-xs font-semibold">No withdrawals yet</p><p class="mt-1 text-[10px] text-muted">Complete a paid booking, then request your first withdrawal.</p></div>
      </div>
    </div>
  </div>
</template>
