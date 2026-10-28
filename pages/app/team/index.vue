<script setup lang="ts">
import { CalendarDays, Clock3, Plus, Scissors, UserRoundCog } from 'lucide-vue-next';
import type { Provider } from '~/types';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Team & schedules' });

const toast = useToast();
const { items, loading, load, create, update, remove } = useProviders();
const open = ref(false);
const saving = ref(false);
const editing = ref<Provider | null>(null);
const removing = ref<Provider | null>(null);
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const defaultHours = () => Array.from({ length: 7 }, (_, day) => ({ day, isWorking: day !== 0, start: '09:00', end: '18:00', breakStart: '', breakEnd: '' }));
const form = reactive({
  name: '', title: '', bio: '', email: '', phone: '', avatarUrl: '', color: '#FF5A1F',
  isBookable: true, isActive: true, weeklySchedule: defaultHours() as { day: number; isWorking: boolean; start: string; end: string; breakStart: string; breakEnd: string }[],
  timeOff: [] as { startAt: string; endAt: string; reason: string }[],
});
const activeCount = computed(() => items.value.filter((p) => p.isActive).length);
const bookableCount = computed(() => items.value.filter((p) => p.isBookable && p.isActive).length);

function reset() {
  Object.assign(form, { name: '', title: '', bio: '', email: '', phone: '', avatarUrl: '', color: '#FF5A1F', isBookable: true, isActive: true, weeklySchedule: defaultHours(), timeOff: [] });
  editing.value = null;
}
function openCreate() { reset(); open.value = true; }
function openEdit(provider: Provider) {
  editing.value = provider;
  const schedule = days.map((_, day) => {
    const found = provider.weeklySchedule.find((d) => d.day === day);
    return { day, isWorking: found?.isWorking ?? false, start: found?.start || '09:00', end: found?.end || '18:00', breakStart: found?.breaks?.[0]?.start || '', breakEnd: found?.breaks?.[0]?.end || '' };
  });
  Object.assign(form, {
    name: provider.name, title: provider.title, bio: provider.bio, email: provider.email || '',
    phone: provider.phone || '', avatarUrl: provider.avatarUrl || '', color: provider.color,
    isBookable: provider.isBookable, isActive: provider.isActive, weeklySchedule: schedule,
    timeOff: provider.timeOff.map((t) => ({ startAt: t.startAt.slice(0, 10), endAt: t.endAt.slice(0, 10), reason: t.reason })),
  });
  open.value = true;
}
function addTimeOff() { form.timeOff.push({ startAt: '', endAt: '', reason: 'Time off' }); }
async function save() {
  if (form.name.trim().length < 2) return toast.error('Add a name for this team member.');
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(), title: form.title.trim(), bio: form.bio.trim(),
      email: form.email || null, phone: form.phone || null, avatarUrl: form.avatarUrl || null,
      color: form.color, isBookable: form.isBookable, isActive: form.isActive,
      weeklySchedule: form.weeklySchedule.map((d) => ({ day: d.day, isWorking: d.isWorking, start: d.start, end: d.end, breaks: d.breakStart && d.breakEnd ? [{ start: d.breakStart, end: d.breakEnd }] : [] })),
      timeOff: form.timeOff.filter((t) => t.startAt && t.endAt).map((t) => ({ startAt: `${t.startAt}T00:00:00+01:00`, endAt: `${t.endAt}T23:59:59+01:00`, reason: t.reason })),
    };
    if (editing.value) await update(editing.value.id, payload as Partial<Provider>);
    else await create(payload as Partial<Provider>);
    toast.success(editing.value ? 'Team member updated.' : 'Team member added.');
    open.value = false;
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function hide() {
  if (!removing.value) return;
  try { await remove(removing.value.id); toast.success('Team member hidden.'); removing.value = null; }
  catch (error) { toast.error((error as Error).message); }
}
function hoursFor(provider: Provider) {
  const working = provider.weeklySchedule.filter((d) => d.isWorking);
  if (!working.length) return 'Uses business hours';
  return `${working.length} days · ${working[0].start}–${working[0].end}`;
}
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Team & schedules" subtitle="Who delivers the work, when they are available and when they are away." eyebrow="People">
      <template #actions><BaseButton @click="openCreate"><Plus class="h-4 w-4" /> Add team member</BaseButton></template>
    </PageHeader>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Team</p><p class="mt-1 font-display text-2xl font-bold">{{ activeCount }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Bookable</p><p class="mt-1 font-display text-2xl font-bold text-success">{{ bookableCount }}</p></div>
      <div class="card p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Services assigned</p><NuxtLink to="/app/services" class="mt-1 inline-flex items-center gap-1 font-display text-2xl font-bold hover:text-brand-600">Manage <Scissors class="h-4 w-4" /></NuxtLink></div>
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2"><div v-for="i in 4" :key="i" class="skeleton h-40 rounded-3xl" /></div>
    <BaseEmptyState v-else-if="!items.length" title="Add your first team member" message="Even a solo owner should be on the team so customers can choose who they want to see." action-label="Add team member" @action="openCreate">
      <template #icon><UserRoundCog class="h-9 w-9" /></template>
    </BaseEmptyState>
    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="provider in items" :key="provider.id" class="card p-5">
        <div class="flex items-start gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-bold text-white" :style="{ background: provider.color }">
            <img v-if="provider.avatarUrl" :src="provider.avatarUrl" :alt="provider.name" class="h-full w-full object-cover"><span v-else>{{ provider.name.slice(0, 1) }}</span>
          </div>
          <div class="min-w-0 flex-1"><h3 class="truncate font-display text-lg font-bold">{{ provider.name }}</h3><p class="text-[11px] text-muted">{{ provider.title || 'Team member' }}</p></div>
          <BaseBadge :variant="provider.isActive && provider.isBookable ? 'success' : 'neutral'">{{ provider.isActive && provider.isBookable ? 'Bookable' : 'Hidden' }}</BaseBadge>
        </div>
        <p v-if="provider.bio" class="mt-3 line-clamp-2 text-[12px] leading-relaxed text-muted">{{ provider.bio }}</p>
        <div class="mt-4 space-y-2 border-t border-line pt-3 text-[11px]">
          <p class="flex items-center gap-2 text-muted"><Clock3 class="h-3.5 w-3.5" /> {{ hoursFor(provider) }}</p>
          <p class="flex items-center gap-2 text-muted"><CalendarDays class="h-3.5 w-3.5" /> {{ provider.upcomingBookings || 0 }} upcoming appointment{{ provider.upcomingBookings === 1 ? '' : 's' }}</p>
        </div>
        <div class="mt-4 flex gap-1 border-t border-line pt-3"><button class="flex-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-raised" @click="openEdit(provider)">Edit schedule</button><button class="rounded-xl px-3 py-2 text-[11px] font-bold text-danger hover:bg-danger/5" @click="removing = provider">Hide</button></div>
      </article>
    </div>

    <BaseModal v-model:open="open" :title="editing ? 'Edit team member' : 'Add team member'" description="Customers choose who delivers their appointment." size="lg">
      <form class="space-y-5" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.name" label="Name" placeholder="e.g. Amaka" required />
          <BaseInput v-model="form.title" label="Role" placeholder="Braider, barber, nail artist…" />
          <BaseInput v-model="form.email" label="Email" type="email" placeholder="Optional" />
          <BaseInput v-model="form.phone" label="Phone" placeholder="Optional" />
          <BaseInput v-model="form.avatarUrl" label="Photo URL" placeholder="https://…" />
          <div><p class="label-base">Colour</p><input v-model="form.color" type="color" class="h-12 w-full rounded-2xl border border-line bg-surface p-1"></div>
        </div>
        <BaseTextarea v-model="form.bio" label="Short bio" placeholder="What should customers know about them?" />
        <div class="flex flex-wrap gap-4"><label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.isBookable" type="checkbox" class="h-4 w-4"> Bookable</label><label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.isActive" type="checkbox" class="h-4 w-4"> Active</label></div>
        <div>
          <div class="flex items-center justify-between"><p class="label-base mb-0">Weekly working hours</p><span class="text-[10px] text-muted">Leave all off to use business hours</span></div>
          <div class="mt-2 space-y-2">
            <div v-for="d in form.weeklySchedule" :key="d.day" class="rounded-xl border border-line p-2">
              <div class="grid grid-cols-[70px_28px_1fr_1fr] items-center gap-2">
                <span class="text-xs font-bold">{{ days[d.day] }}</span>
                <input v-model="d.isWorking" type="checkbox" class="h-4 w-4" :aria-label="`${days[d.day]} working`">
                <input v-model="d.start" type="time" class="input-base !py-2 !text-xs" :disabled="!d.isWorking" :aria-label="`${days[d.day]} start`">
                <input v-model="d.end" type="time" class="input-base !py-2 !text-xs" :disabled="!d.isWorking" :aria-label="`${days[d.day]} end`">
              </div>
              <div v-if="d.isWorking" class="mt-1.5 grid grid-cols-[70px_1fr_1fr] items-center gap-2">
                <span class="text-[9px] font-semibold text-muted">Break</span>
                <input v-model="d.breakStart" type="time" class="input-base !py-1.5 !text-[10px]" :aria-label="`${days[d.day]} break start`">
                <input v-model="d.breakEnd" type="time" class="input-base !py-1.5 !text-[10px]" :aria-label="`${days[d.day]} break end`">
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between"><p class="label-base mb-0">Time off</p><button type="button" class="text-xs font-bold text-brand-600" @click="addTimeOff">+ Add time off</button></div>
          <div v-for="(off, i) in form.timeOff" :key="i" class="mt-2 grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-[1fr_1fr_1fr_36px]">
            <BaseDatePicker v-model="off.startAt" label="From" />
            <BaseDatePicker v-model="off.endAt" label="To" />
            <BaseInput v-model="off.reason" label="Reason" placeholder="Holiday" />
            <button type="button" class="flex h-11 items-center justify-center self-end rounded-xl text-danger hover:bg-danger/5" aria-label="Remove time off" @click="form.timeOff.splice(i, 1)">×</button>
          </div>
        </div>
        <div class="flex justify-end gap-2"><BaseButton type="button" variant="ghost" @click="open = false">Cancel</BaseButton><BaseButton type="submit" :loading="saving"><UserRoundCog class="h-4 w-4" /> Save team member</BaseButton></div>
      </form>
    </BaseModal>

    <ConfirmDialog :open="!!removing" danger title="Hide this team member?" message="They will stop accepting new bookings. Existing appointments stay intact." confirm-label="Hide member" @update:open="(v) => { if (!v) removing = null; }" @confirm="hide" />
  </div>
</template>
