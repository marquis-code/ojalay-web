import { providersApi } from '~/api/factories/providersApi';
import type { Provider } from '~/types';

export function useProviders() {
  const items = ref<Provider[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true; error.value = null;
    try { items.value = await providersApi.listProviders(); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: Partial<Provider>) { const p = await providersApi.createProvider(payload); await load(); return p; }
  async function update(id: string, payload: Partial<Provider>) { const p = await providersApi.updateProvider(id, payload); await load(); return p; }
  async function remove(id: string) { await providersApi.removeProvider(id); await load(); }
  return { items, loading, error, load, create, update, remove };
}
