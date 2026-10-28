<script setup lang="ts">
import { ArrowLeft, BellRing, CalendarClock, Check, Trash2, Users } from 'lucide-vue-next';
import { formatDate } from '~/utils/date';
import { prettyPhone, whatsappLink } from '~/utils/phone';
import type { WaitlistEntry } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Waitlist' });

const toast = useToast();
const { items, loading, filter, load, notify, setStatus, remove } = useWaitlist();
const busy = ref<string | null>(null);
const filters = [
  { value: 'all', label: 'Everyone' }, { value: 'waiting', label: 'Waiting' },
  { value: 'notified', label: 'Notified' }, { value: 'booked', label: 'Booked' }, { value: 'cancelled', label: 'Cancelled' },
];
const counts = computed(() => ({
  waiting: items.value.filter((e) => e.status === 'waiting').length,
  notified: items.value.filter((e) => e.status === 'notified').length,
}));
async function act(entry: WaitlistEntry, action: 'notify' | 'booked' | 'cancelled') {
  busy.value = entry.id;
  try {
    if (action === 'notify') await notify(entry.id);
    else await setStatus(entry.id, action);
    toast.success(action === 'notify' ? 'Waitlist customer notified.' : `Marked ${action}.`);
  } catch (error) { toast.error((error as Error).message); }
  finally { busy.value = null; }
}
async function removeEntry(entry: WaitlistEntry) {
  busy.value = entry.id;
  try { await remove(entry.id); toast.success('Waitlist request removed.'); }
  catch (error) { toast.error((error as Error).message); }
  finally { busy.value = null; }
}
watch(filter, load);
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/app/bookings" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to appointments</NuxtLink>
    <PageHeader title="Waitlist" subtitle="People who wanted a time you did not have. Notify them the moment a slot opens." eyebrow="Bookings" />

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Waiting</p><p class="mt-1 font-display text-2xl font-bold">{{ counts.waiting }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Notified</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ counts.notified }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">How it works</p><p class="mt-1 text-xs leading-relaxed text-muted">When a client cancels, open this list and notify the closest match. They get the booking link by email and WhatsApp.</p></div>
    </div>

    <div class="flex flex-wrap gap-2"><button v-for="f in filters" :key="f.value" type="button" class="rounded-full border px-3.5 py-2 text-[11px] font-bold" :class="filter === f.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-muted'" @click="filter = f.value">{{ f.label }}</button></div>

    <div v-if="loading" class="space-y-2"><div v-for="i in 3" :key="i" class="skeleton h-28 rounded-2xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="No one is waiting" message="When a day is fully booked, customers can join the waitlist from your service page. They will appear here.">
      <template #icon><Users class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="space-y-2">
      <article v-for="entry in items" :key="entry.id" class="card p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2"><p class="font-bold">{{ entry.customerName }}</p><BaseBadge :variant="entry.status === 'notified' ? 'success' : entry.status === 'booked' ? 'brand' : entry.status === 'cancelled' ? 'danger' : 'warning'">{{ entry.status }}</BaseBadge></div>
            <p class="mt-1 text-xs text-muted">{{ entry.serviceName }} · {{ prettyPhone(entry.customerPhone) }}</p>
            <p class="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted"><CalendarClock class="h-3.5 w-3.5" /> Wants {{ formatDate(entry.preferredFrom) }} – {{ formatDate(entry.preferredTo) }}</p>
            <p v-if="entry.notes" class="mt-1 text-[11px] text-muted">{{ entry.notes }}</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <BaseButton v-if="entry.status === 'waiting' || entry.status === 'notified'" size="sm" :loading="busy === entry.id" @click="act(entry, 'notify')"><BellRing class="h-3.5 w-3.5" /> Notify</BaseButton>
            <BaseButton v-if="entry.status === 'waiting' || entry.status === 'notified'" size="sm" variant="outline" :loading="busy === entry.id" @click="act(entry, 'booked')"><Check class="h-3.5 w-3.5" /> Booked</BaseButton>
            <a :href="whatsappLink(entry.customerPhone, `Hi ${entry.customerName.split(' ')[0]}! A spot may have opened for ${entry.serviceName}.`)" target="_blank" rel="noopener" class="inline-flex min-h-[36px] items-center rounded-xl border border-line px-3 text-xs font-bold">WhatsApp</a>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-xl text-danger hover:bg-danger/5" aria-label="Remove waitlist entry" @click="removeEntry(entry)"><Trash2 class="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
