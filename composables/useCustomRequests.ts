import { customRequestsApi } from '~/api/factories/customRequestsApi';
import type { CustomRequest } from '~/types';

export function useCustomRequests() {
  const items = ref<CustomRequest[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  async function load() {
    loading.value = true; error.value = null;
    try { items.value = await customRequestsApi.listRequests(); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  return { items, loading, error, load };
}
