import { calendarApi } from '~/api/factories/calendarApi';
import type { CalendarStatus } from '~/api/factories/calendarApi';

export function useCalendar() {
  const status = ref<CalendarStatus | null>(null);
  const loading = ref(false);
  const syncing = ref(false);
  async function load() { loading.value = true; try { status.value = await calendarApi.status(); } finally { loading.value = false; } }
  async function connect(provider: 'google' | 'outlook') { const result = await calendarApi.connect(provider); window.location.href = result.url; }
  async function sync() { syncing.value = true; try { return await calendarApi.sync(); } finally { syncing.value = false; } }
  async function disconnect(provider: 'google' | 'outlook') { await calendarApi.disconnect(provider); await load(); }
  return { status, loading, syncing, load, connect, sync, disconnect };
}
