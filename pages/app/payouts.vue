<script setup lang="ts">
import { AlertCircle, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, Check, CheckCircle2, Copy, ExternalLink, Gift, History, Info, Link2, Loader2, MessageCircle, Percent, Plus, ShieldCheck, Users, Wallet } from 'lucide-vue-next';
import { formatDate, formatDateTime } from '~/utils/date';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';

definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Payouts & withdrawals' });

const auth = useAuthStore();
const businessStore = useBusinessStore();
const toast = useToast();
const affiliate = useAffiliate();

const payoutOpen = ref(false);
const detailsOpen = ref(false);
const details = reactive({ bankName: '', accountName: '', accountNumber: '' });
const payout = reactive({ amount: '' });

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  requested: 'warning',
  rejected: 'danger',
  pending: 'warning',
  available: 'success',
};

const statusLabels: Record<string, string> = {
  paid: 'Transferred',
  requested: 'Under review',
  rejected: 'Rejected & restored',
  pending: 'On hold',
};

const availableKobo = computed(() => affiliate.data.value?.stats.availableKobo || 0);
const minimumKobo = computed(() => affiliate.data.value?.minimumPayoutKobo || 100000);
const canWithdraw = computed(() => availableKobo.value >= minimumKobo.value);

function setQuickAmount(kobo: number) {
  const actualKobo = Math.min(kobo, availableKobo.value);
  payout.amount = String(Math.floor(actualKobo / 100));
}

function openPayoutModal() {
  if (!affiliate.data.value) return;
  if (!details.bankName || !details.accountNumber) {
    detailsOpen.value = true;
    toast.info('Please add your bank account before requesting a withdrawal.');
    return;
  }
  if (!canWithdraw.value) {
    toast.warning(`Minimum withdrawal is ${formatNaira(minimumKobo.value)}.`);
    return;
  }
  payout.amount = String(Math.floor(availableKobo.value / 100));
  payoutOpen.value = true;
}

async function saveDetails() {
  if (!details.bankName.trim() || !details.accountName.trim() || !/^\d{10}$/.test(details.accountNumber.trim())) {
    toast.error('Enter your bank name, account name, and a valid 10-digit NUBAN account number.');
    return;
  }
  try {
    await affiliate.updateDetails({
      bankName: details.bankName.trim(),
      accountName: details.accountName.trim(),
      accountNumber: details.accountNumber.trim(),
    });
    toast.success('Payout bank details saved successfully.');
    detailsOpen.value = false;
  } catch (error) {
    toast.error((error as Error).message);
  }
}

async function requestPayout() {
  if (!affiliate.data.value) return;
  const amountKobo = nairaToKobo(payout.amount);
  if (amountKobo < minimumKobo.value) {
    toast.error(`Minimum withdrawal amount is ${formatNaira(minimumKobo.value)}.`);
    return;
  }
  if (amountKobo > availableKobo.value) {
    toast.error('Requested amount exceeds your available balance.');
    return;
  }
  if (!details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) {
    toast.error('Please save your Nigerian bank account before requesting a withdrawal.');
    detailsOpen.value = true;
    return;
  }
  try {
    await affiliate.requestPayout({
      amountKobo,
      bankName: details.bankName,
      accountName: details.accountName,
      accountNumber: details.accountNumber,
    });
    toast.success('Withdrawal requested! We review and process bank transfers within 1-2 business days.');
    payoutOpen.value = false;
    payout.amount = '';
    await affiliate.load();
  } catch (error) {
    toast.error((error as Error).message);
  }
}

onMounted(async () => {
  try {
    await affiliate.load();
    const saved = affiliate.data.value?.payoutDetails;
    if (saved && saved.bankName) {
      Object.assign(details, {
        bankName: saved.bankName || '',
        accountName: saved.accountName || '',
        accountNumber: saved.accountNumber || '',
      });
    } else if (businessStore.business?.settlementAccountNumber) {
      // Pre-fill from business settings if present
      Object.assign(details, {
        bankName: businessStore.business.settlementBankName || '',
        accountName: businessStore.business.settlementAccountName || '',
        accountNumber: businessStore.business.settlementAccountNumber || '',
      });
    }
  } catch (error) {
    toast.error((error as Error).message);
  }
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Payouts & withdrawals"
      subtitle="View your earnings, manage your destination bank account, and request withdrawals."
      eyebrow="Money & people"
    >
      <template #actions>
        <BaseButton
          variant="primary"
          :disabled="!canWithdraw"
          @click="openPayoutModal"
        >
          <Banknote class="h-4 w-4" /> Request withdrawal
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Permission Check: Owner Only -->
    <div v-if="!auth.isOwner" class="card p-8 text-center">
      <ShieldCheck class="mx-auto h-8 w-8 text-brand-500" />
      <h2 class="mt-3 font-display text-xl font-bold">Payouts are restricted to the business owner</h2>
      <p class="mt-1 text-xs text-muted">Only the business owner can view withdrawal balances and manage bank accounts.</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="affiliate.loading.value && !affiliate.data.value" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="skeleton h-28 rounded-2xl" />
      </div>
      <div class="skeleton h-64 rounded-3xl" />
    </div>

    <!-- Error State -->
    <div v-else-if="!affiliate.data.value" class="card p-8 text-center">
      <AlertCircle class="mx-auto h-8 w-8 text-warning" />
      <p class="mt-3 font-bold">Unable to load payout balance</p>
      <p class="mt-1 text-xs text-muted">{{ affiliate.error.value }}</p>
      <BaseButton size="sm" class="mt-3" @click="affiliate.load()">Try again</BaseButton>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- 4 Balanced Stat Cards -->
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Available to withdraw</p>
            <Wallet class="h-4 w-4 text-success" />
          </div>
          <p class="mt-2 font-display text-3xl font-bold text-ink">{{ formatNaira(availableKobo) }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-[10px] text-muted">Min. {{ formatNaira(minimumKobo) }}</span>
            <span
              v-if="canWithdraw"
              class="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success"
            >
              Ready to withdraw
            </span>
            <span
              v-else
              class="rounded-full bg-muted/10 px-2 py-0.5 text-[9px] font-semibold text-muted"
            >
              Below ₦1,000 threshold
            </span>
          </div>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">On hold (clearing)</p>
            <Loader2 class="h-4 w-4 text-warning" />
          </div>
          <p class="mt-2 font-display text-3xl font-bold text-ink">{{ formatNaira(affiliate.data.value.stats.pendingKobo) }}</p>
          <p class="mt-2 text-[10px] text-muted">Clears {{ affiliate.data.value.holdDays }} days after customer payment</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total paid out</p>
            <Banknote class="h-4 w-4 text-brand-500" />
          </div>
          <p class="mt-2 font-display text-3xl font-bold text-ink">{{ formatNaira(affiliate.data.value.stats.paidKobo) }}</p>
          <p class="mt-2 text-[10px] text-muted">Successfully transferred to bank</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Total earned</p>
            <Percent class="h-4 w-4 text-brand-500" />
          </div>
          <p class="mt-2 font-display text-3xl font-bold text-ink">{{ formatNaira(affiliate.data.value.stats.totalEarnedKobo) }}</p>
          <p class="mt-2 text-[10px] text-muted">All-time earnings on Ojaly</p>
        </div>
      </div>

      <!-- Main Columns: Bank Details + Withdrawal Action & History -->
      <div class="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <!-- Left: Withdrawal Requests Table -->
        <div class="card">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <h2 class="font-display text-lg font-bold">Withdrawal history</h2>
              <p class="text-xs text-muted">Every withdrawal requested, processed, or transferred.</p>
            </div>
            <BaseBadge variant="brand">{{ affiliate.data.value.payouts.length }} total</BaseBadge>
          </div>

          <div v-if="affiliate.data.value.payouts.length" class="divide-y divide-line">
            <div
              v-for="item in affiliate.data.value.payouts"
              :key="item.id"
              class="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-raised/30 sm:px-5"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-display text-base font-bold text-ink">{{ formatNaira(item.amountKobo) }}</p>
                  <BaseBadge :variant="statusVariant[item.status] || 'neutral'">
                    {{ statusLabels[item.status] || item.status }}
                  </BaseBadge>
                </div>
                <p class="mt-0.5 text-xs text-muted">
                  {{ item.bankName }} · {{ item.accountNumber }}
                  <span v-if="item.accountName">({{ item.accountName }})</span>
                </p>
                <p v-if="item.reference" class="mt-0.5 font-mono text-[10px] text-muted">Ref: {{ item.reference }}</p>
                <p v-if="item.note && item.status === 'rejected'" class="mt-0.5 text-[11px] font-semibold text-danger">Reason: {{ item.note }}</p>
              </div>
              <div class="text-right text-[11px] text-muted">
                <p class="font-medium">{{ formatDateTime(item.createdAt) }}</p>
                <p v-if="item.processedAt" class="text-[10px] text-success">Completed {{ formatDate(item.processedAt) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="p-10 text-center">
            <Banknote class="mx-auto h-8 w-8 text-muted" />
            <p class="mt-3 font-display text-lg font-bold">No withdrawals yet</p>
            <p class="mt-1 text-xs text-muted">
              Once you have at least {{ formatNaira(minimumKobo) }} available, request a withdrawal and it will appear here.
            </p>
            <BaseButton
              v-if="canWithdraw"
              size="sm"
              class="mt-4"
              @click="openPayoutModal"
            >
              Request withdrawal
            </BaseButton>
          </div>
        </div>

        <!-- Right: Destination Bank Details & Quick Action Card -->
        <div class="space-y-4">
          <!-- Destination Bank Account Card -->
          <BaseCard>
            <div class="flex items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <h3 class="font-display text-base font-bold">Destination bank</h3>
                <p class="text-[11px] text-muted">Transfers are sent to this Nigerian account.</p>
              </div>
              <button
                type="button"
                class="text-xs font-bold text-brand-600 hover:underline dark:text-brand-300"
                @click="detailsOpen = true"
              >
                {{ details.bankName ? 'Change' : 'Add account' }}
              </button>
            </div>

            <div v-if="details.bankName" class="mt-4 rounded-2xl bg-raised/50 p-4">
              <div class="flex items-center gap-2">
                <ShieldCheck class="h-4 w-4 text-success" />
                <span class="text-[10px] font-bold uppercase tracking-wider text-success">Verified destination</span>
              </div>
              <p class="mt-2 text-sm font-bold text-ink">{{ details.bankName }}</p>
              <p class="mt-0.5 font-mono text-xs font-semibold text-ink">{{ details.accountNumber }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ details.accountName }}</p>
            </div>

            <div v-else class="mt-4 rounded-2xl border border-dashed border-line p-4 text-center">
              <Banknote class="mx-auto h-6 w-6 text-muted" />
              <p class="mt-2 text-xs font-semibold text-ink">No bank account added yet</p>
              <p class="mt-1 text-[11px] text-muted">Add your Nigerian bank details before requesting a payout.</p>
              <BaseButton size="sm" variant="outline" class="mt-3" @click="detailsOpen = true">
                Add bank account
              </BaseButton>
            </div>

            <div class="mt-4 border-t border-line pt-4">
              <BaseButton
                block
                size="md"
                variant="primary"
                :disabled="!canWithdraw || !details.bankName"
                @click="openPayoutModal"
              >
                <Banknote class="h-4 w-4" /> Request withdrawal
              </BaseButton>
              <p v-if="!canWithdraw" class="mt-2 text-center text-[10px] text-muted">
                You need at least {{ formatNaira(minimumKobo) }} to request a withdrawal.
              </p>
            </div>
          </BaseCard>

          <!-- Refer & Earn Link Card -->
          <BaseCard class="bg-forest-900 text-white">
            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-400">
              <Gift class="h-3.5 w-3.5" /> Boost your earnings
            </div>
            <h4 class="mt-2 font-display text-base font-bold text-white">Earn 20% on referrals</h4>
            <p class="mt-1 text-xs text-white/70">
              Share your link with other business owners. When they subscribe, you earn 20% commission directly into your withdrawable balance.
            </p>
            <NuxtLink
              to="/app/affiliates"
              class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              Open referral programme <ArrowUpRight class="h-3.5 w-3.5" />
            </NuxtLink>
          </BaseCard>

          <!-- How It Works Card -->
          <BaseCard>
            <h4 class="font-display text-sm font-bold text-ink">How withdrawals work</h4>
            <ol class="mt-3 space-y-2.5 text-xs text-muted">
              <li class="flex gap-2">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-raised text-[10px] font-bold text-ink">1</span>
                <span>Request a withdrawal whenever your available balance is ₦1,000 or more.</span>
              </li>
              <li class="flex gap-2">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-raised text-[10px] font-bold text-ink">2</span>
                <span>Transfers are reviewed and dispatched via Nigerian bank transfer within 1-2 business days.</span>
              </li>
              <li class="flex gap-2">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-raised text-[10px] font-bold text-ink">3</span>
                <span>Once sent, the transfer reference is updated here for full accounting reconciliation.</span>
              </li>
            </ol>
          </BaseCard>
        </div>
      </div>
    </template>

    <!-- Modal: Edit Bank Details -->
    <BaseModal
      v-model:open="detailsOpen"
      title="Payout bank account"
      description="Enter a Nigerian bank account in your or your registered business's name."
    >
      <div class="space-y-3">
        <BaseInput
          v-model="details.bankName"
          label="Bank name"
          placeholder="e.g. GTBank, Zenith, Access, Kuda, Moniepoint"
        />
        <BaseInput
          v-model="details.accountNumber"
          label="10-digit account number (NUBAN)"
          inputmode="numeric"
          :maxlength="10"
          placeholder="0123456789"
        />
        <BaseInput
          v-model="details.accountName"
          label="Account name"
          placeholder="e.g. Ayotomiwa Oshinowo or Business Name"
        />
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <BaseButton variant="ghost" @click="detailsOpen = false">Cancel</BaseButton>
        <BaseButton :loading="affiliate.saving.value" @click="saveDetails">Save bank details</BaseButton>
      </div>
    </BaseModal>

    <!-- Modal: Request Withdrawal -->
    <BaseModal
      v-model:open="payoutOpen"
      title="Request a withdrawal"
      :description="`Available balance: ${formatNaira(availableKobo)}`"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="payout.amount"
          label="Withdrawal amount (₦)"
          prefix="₦"
          inputmode="decimal"
          :hint="`Minimum ${formatNaira(minimumKobo)}. Max ${formatNaira(availableKobo)}.`"
        />

        <!-- Quick Amount Pills -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-if="availableKobo >= 500000"
            type="button"
            class="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-raised"
            @click="setQuickAmount(500000)"
          >
            ₦5,000
          </button>
          <button
            v-if="availableKobo >= 1000000"
            type="button"
            class="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-raised"
            @click="setQuickAmount(1000000)"
          >
            ₦10,000
          </button>
          <button
            v-if="availableKobo >= 2500000"
            type="button"
            class="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-raised"
            @click="setQuickAmount(2500000)"
          >
            ₦25,000
          </button>
          <button
            type="button"
            class="rounded-lg border border-brand-500/30 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
            @click="setQuickAmount(availableKobo)"
          >
            All available ({{ formatNaira(availableKobo) }})
          </button>
        </div>

        <!-- Destination summary box -->
        <div class="rounded-2xl bg-raised/60 p-3.5 text-xs">
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Destination account</p>
          <p class="mt-1 font-bold text-ink">{{ details.bankName }} · {{ details.accountNumber }}</p>
          <p class="text-muted">{{ details.accountName }}</p>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <BaseButton variant="ghost" @click="payoutOpen = false">Cancel</BaseButton>
        <BaseButton
          variant="primary"
          :loading="affiliate.saving.value"
          @click="requestPayout"
        >
          <Banknote class="h-4 w-4" /> Confirm withdrawal
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
