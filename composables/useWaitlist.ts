import { waitlistApi } from '~/api/factories/waitlistApi';
import type { WaitlistEntry } from '~/types';

export function useWaitlist() {
  const items = ref<WaitlistEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref('all');

  async function load() {
    loading.value = true; error.value = null;
    try { items.value = await waitlistApi.listEntries(filter.value); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function notify(id: string) { const entry = await waitlistApi.notify(id); await load(); return entry; }
  async function setStatus(id: string, status: WaitlistEntry['status']) { const entry = await waitlistApi.setStatus(id, status); await load(); return entry; }
  async function remove(id: string) { await waitlistApi.removeEntry(id); await load(); }
  return { items, loading, error, filter, load, notify, setStatus, remove };
}
