import { packagesApi } from '~/api/factories/packagesApi';
import type { PackagePurchase, ServicePackage } from '~/types';

export function usePackages() {
  const items = ref<ServicePackage[]>([]);
  const purchases = ref<PackagePurchase[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  async function load() {
    loading.value = true; error.value = null;
    try { [items.value, purchases.value] = await Promise.all([packagesApi.listPackages(), packagesApi.listPurchases()]); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function create(payload: Record<string, unknown>) { const item = await packagesApi.createPackage(payload); await load(); return item; }
  async function update(id: string, payload: Record<string, unknown>) { const item = await packagesApi.updatePackage(id, payload); await load(); return item; }
  async function remove(id: string) { await packagesApi.removePackage(id); await load(); }
  return { items, purchases, loading, error, load, create, update, remove };
}
