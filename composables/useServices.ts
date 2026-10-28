import { servicesApi } from '~/api/factories/servicesApi';
import type { Service } from '~/types';

export function useServices() {
  const items = ref<Service[]>([]);
  const categories = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const active = computed(() => items.value.filter((s) => s.isActive));

  async function load() {
    loading.value = true; error.value = null;
    try {
      [items.value, categories.value] = await Promise.all([servicesApi.listServices(), servicesApi.categories()]);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: Partial<Service>) { const s = await servicesApi.createService(payload); await load(); return s; }
  async function update(id: string, payload: Partial<Service>) { const s = await servicesApi.updateService(id, payload); await load(); return s; }
  async function remove(id: string) { await servicesApi.removeService(id); await load(); }
  return { items, active, categories, loading, error, load, create, update, remove };
}
