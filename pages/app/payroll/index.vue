<script setup lang="ts">
import { Banknote, Check, ChevronRight, CircleDollarSign, RefreshCw, Send, Users, WalletCards } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import type { PayrollItem } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Payroll' });
const toast = useToast();
const { runs, selected, loading, saving, load, generate, updateItem, approve, pay, verify, cancel } = usePayroll();
const frequency = ref<'daily' | 'weekly' | 'monthly' | 'per_service'>('monthly');
const period = ref(new Date().toISOString().slice(0, 7));
const monthOptions = computed(() => {
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const value = d.toISOString().slice(0, 7);
    out.push({ value, label: d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) });
  }
  return out;
});
const usesDate = computed(() => frequency.value === 'daily' || frequency.value === 'weekly');
watch(frequency, () => { period.value = usesDate.value ? new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 7); });
function periodLabel(run: { period: string; frequency?: string; periodStart?: string }) {
  if (run.periodStart) return new Date(run.periodStart).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  return run.period;
}
const adjustOpen = ref(false);
const adjustItem = ref<PayrollItem | null>(null);
const adjust = reactive({ adjustment: '', deduction: '', note: '' });
const payOpen = ref(false);
const activeRun = computed(() => selected.value);
const totalPaid = computed(() => runs.value.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.totalKobo, 0));
const pendingTotal = computed(() => runs.value.filter((r) => ['draft', 'approved', 'processing', 'partially_paid'].includes(r.status)).reduce((sum, r) => sum + r.totalKobo, 0));
const statusTone: Record<string, string> = { draft: 'neutral', approved: 'warning', processing: 'brand', partially_paid: 'warning', paid: 'success', cancelled: 'danger' };
async function createRun() { try { const run = await generate(frequency.value, period.value); selected.value = run; toast.success('Payroll draft created. Review and approve it.'); } catch (error) { toast.error((error as Error).message); } }
function openAdjust(item: PayrollItem) { adjustItem.value = item; adjust.adjustment = String(item.adjustmentKobo / 100 || ''); adjust.deduction = String(item.deductionKobo / 100 || ''); adjust.note = item.note || ''; adjustOpen.value = true; }
async function saveAdjust() { if (!activeRun.value || !adjustItem.value) return; try { await updateItem(activeRun.value.id, adjustItem.value.providerId, { adjustmentKobo: Math.round(Number(adjust.adjustment || 0) * 100), deductionKobo: Math.round(Number(adjust.deduction || 0) * 100), note: adjust.note }); adjustOpen.value = false; toast.success('Payroll item updated.'); } catch (error) { toast.error((error as Error).message); } }
async function approveRun() { if (!activeRun.value) return; try { await approve(activeRun.value.id); toast.success('Payroll approved. You can now release payment.'); } catch (error) { toast.error((error as Error).message); } }
async function payRun() { if (!activeRun.value) return; payOpen.value = false; try { const run = await pay(activeRun.value.id); const failed = run.items.filter((item) => item.status === 'failed').length; toast.success(failed ? `Payroll released. ${failed} transfer${failed === 1 ? '' : 's'} need attention.` : 'Salary transfers sent to Paystack.'); } catch (error) { toast.error((error as Error).message); } }
async function verifyRun() { if (!activeRun.value) return; try { await verify(activeRun.value.id); toast.info('Transfer statuses refreshed.'); } catch (error) { toast.error((error as Error).message); } }
async function cancelRun() { if (!activeRun.value) return; try { await cancel(activeRun.value.id); toast.info('Payroll draft cancelled.'); } catch (error) { toast.error((error as Error).message); } }
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Payroll" subtitle="Monthly salaries for your team, with job completion and one clean approval trail." eyebrow="People">
      <template #actions><NuxtLink to="/app/team" class="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:bg-raised sm:inline-flex"><Users class="h-4 w-4" /> Team</NuxtLink></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Runs</p><p class="mt-1 font-display text-2xl font-bold">{{ runs.length }}</p><p class="text-[11px] text-muted">payroll periods</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Awaiting release</p><p class="mt-1 font-display text-2xl font-bold text-warning">{{ formatNaira(pendingTotal) }}</p><p class="text-[11px] text-muted">draft, approved or processing</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Paid</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ formatNaira(totalPaid) }}</p><p class="text-[11px] text-muted">through Paystack</p></div>
    </div>

    <div class="card p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 class="font-display text-lg font-bold">Start a payroll run</h2><p class="mt-1 text-xs text-muted">Daily, weekly, monthly or per completed service. Job completion is counted from appointments in the selected period.</p></div>
        <div class="flex flex-col gap-2 sm:flex-row"><BaseSelect v-model="frequency" :options="[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'per_service', label: 'Per completed service' }]" aria-label="Pay frequency" class="!w-48" /><BaseDatePicker v-if="usesDate" v-model="period" aria-label="Payroll period date" /><BaseSelect v-else v-model="period" :options="monthOptions" aria-label="Payroll month" /><BaseButton :loading="saving" @click="createRun"><Banknote class="h-4 w-4" /> Generate draft</BaseButton></div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <BaseCard class="p-0">
        <div class="border-b border-line p-4"><h2 class="font-display text-lg font-bold">Payroll history</h2></div>
        <div v-if="loading" class="space-y-2 p-3"><div v-for="i in 3" :key="i" class="skeleton h-20 rounded-xl" /></div>
        <div v-else-if="runs.length" class="divide-y divide-line"><button v-for="run in runs" :key="run.id" type="button" class="w-full p-4 text-left transition hover:bg-raised/50" :class="activeRun?.id === run.id ? 'bg-raised/60' : ''" @click="selected = run"><div class="flex items-center justify-between gap-2"><div><p class="text-xs font-bold">{{ periodLabel(run) }}</p><p class="mt-0.5 text-[10px] text-muted">{{ run.items.length }} team member{{ run.items.length === 1 ? '' : 's' }}</p></div><BaseBadge :variant="(statusTone[run.status] as any) || 'neutral'">{{ run.status.replace('_', ' ') }}</BaseBadge></div><div class="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{{ formatNaira(run.totalKobo) }}</span><span>{{ run.items.filter((i) => i.status === 'paid').length }} paid</span></div></button></div>
        <div v-else class="p-8 text-center"><CircleDollarSign class="mx-auto h-7 w-7 text-muted" /><p class="mt-3 text-sm font-bold">No payroll yet.</p><p class="mt-1 text-xs text-muted">Enable a salary on a team member, then generate a run.</p></div>
      </BaseCard>

      <div v-if="activeRun" class="space-y-4">
        <BaseCard>
          <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">{{ periodLabel(activeRun) }}</p><h2 class="mt-1 font-display text-2xl font-bold">{{ formatNaira(activeRun.totalKobo) }}</h2><p class="mt-1 text-xs text-muted">{{ activeRun.frequency?.replace('_', ' ') }} · {{ activeRun.items.length }} team members · {{ activeRun.status.replace('_', ' ') }}</p></div><div class="flex flex-wrap gap-2"><BaseButton v-if="activeRun.status === 'draft'" :loading="saving" @click="approveRun"><Check class="h-4 w-4" /> Approve payroll</BaseButton><BaseButton v-if="['approved', 'processing', 'partially_paid'].includes(activeRun.status)" :loading="saving" @click="payOpen = true"><Send class="h-4 w-4" /> Release salaries</BaseButton><BaseButton v-if="['processing', 'partially_paid'].includes(activeRun.status)" variant="outline" :loading="saving" @click="verifyRun"><RefreshCw class="h-4 w-4" /> Refresh</BaseButton><BaseButton v-if="activeRun.status === 'draft'" variant="ghost" class="!text-danger" @click="cancelRun">Cancel draft</BaseButton></div></div>
          <p class="mt-3 rounded-xl bg-warning/10 p-3 text-[11px] leading-relaxed text-warning"><WalletCards class="mr-1 inline h-3.5 w-3.5" /> Salary is sent through Paystack after approval. Each team member needs a valid bank code and account number in their team profile.</p>
        </BaseCard>

        <BaseCard class="p-0">
          <div class="border-b border-line p-4"><h2 class="font-display text-lg font-bold">Team payroll</h2></div>
          <div class="divide-y divide-line">
            <div v-for="item in activeRun.items" :key="item.providerId" class="p-4">
              <div class="flex flex-wrap items-start justify-between gap-3"><div class="min-w-0"><p class="text-sm font-bold">{{ item.providerName }}</p><p class="mt-0.5 text-[10px] text-muted">{{ item.completedJobs }} completed of {{ item.assignedJobs }} assigned · {{ item.completionRate }}% completion</p></div><div class="text-right"><p class="font-display text-xl font-bold">{{ formatNaira(item.netKobo) }}</p><BaseBadge :variant="item.status === 'paid' ? 'success' : item.status === 'failed' ? 'danger' : item.status === 'processing' ? 'brand' : 'neutral'">{{ item.status }}</BaseBadge></div></div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4"><div class="rounded-lg bg-raised/50 p-2"><p class="text-muted">Rate</p><p class="mt-0.5 font-bold">{{ formatNaira(item.payRateKobo || item.monthlySalaryKobo) }}</p></div><div class="rounded-lg bg-raised/50 p-2"><p class="text-muted">Gross</p><p class="mt-0.5 font-bold">{{ formatNaira(item.grossKobo || item.monthlySalaryKobo) }}</p></div><div class="rounded-lg bg-raised/50 p-2"><p class="text-muted">Adjustment / deduction</p><p class="mt-0.5 font-bold">{{ formatNaira(item.adjustmentKobo) }} / -{{ formatNaira(item.deductionKobo) }}</p></div><div class="rounded-lg bg-raised/50 p-2"><p class="text-muted">Reference</p><p class="mt-0.5 truncate font-mono text-[9px]">{{ item.transferReference || '—' }}</p></div></div><p v-if="activeRun.frequency === 'per_service'" class="mt-2 text-[10px] text-muted">{{ item.units || 0 }} completed service{{ item.units === 1 ? '' : 's' }} × {{ formatNaira(item.payRateKobo || 0) }}</p>
              <p v-if="item.note" class="mt-2 text-[11px] text-muted">{{ item.note }}</p>
              <p v-if="item.failureReason" class="mt-2 rounded-lg bg-danger/5 p-2 text-[10px] text-danger">{{ item.failureReason }}</p>
              <div class="mt-2 flex justify-end"><button v-if="['draft', 'approved'].includes(activeRun.status)" type="button" class="text-[10px] font-bold text-brand-600" @click="openAdjust(item)">Adjust pay</button></div>
            </div>
          </div>
        </BaseCard>
      </div>
      <BaseCard v-else class="flex min-h-[280px] items-center justify-center text-center"><div><CircleDollarSign class="mx-auto h-8 w-8 text-muted" /><p class="mt-3 font-display text-lg font-bold">No payroll selected</p><p class="mt-1 text-xs text-muted">Generate a run to get started.</p></div></BaseCard>
    </div>

    <BaseModal v-model:open="adjustOpen" :title="`Adjust ${adjustItem?.providerName || 'salary'}`" description="Adjustments add pay. Deductions reduce pay. The net is what Paystack will send." size="sm">
      <div class="space-y-3"><BaseInput v-model="adjust.adjustment" label="Adjustment (₦)" prefix="₦" inputmode="decimal" /><BaseInput v-model="adjust.deduction" label="Deduction (₦)" prefix="₦" inputmode="decimal" /><BaseTextarea v-model="adjust.note" label="Note" placeholder="Why is this adjusted?" /></div>
      <div class="mt-4 flex justify-end gap-2"><BaseButton variant="ghost" @click="adjustOpen = false">Cancel</BaseButton><BaseButton :loading="saving" @click="saveAdjust">Save adjustment</BaseButton></div>
    </BaseModal>

    <ConfirmDialog v-model:open="payOpen" title="Release this payroll?" message="Paystack will attempt a bank transfer to every team member. Make sure the payroll has been approved and the bank details are correct." confirm-label="Release via Paystack" :loading="saving" @confirm="payRun" />
  </div>
</template>
