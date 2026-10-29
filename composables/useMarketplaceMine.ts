import { marketplaceApi } from '~/api/factories/marketplaceApi';
import type { MarketplaceMine } from '~/types';

export function useMarketplaceMine() {
  const data = ref<MarketplaceMine | null>(null);
  const loading = ref(false);
  async function load() { loading.value = true; try { data.value = await marketplaceApi.mine(); } finally { loading.value = false; } }
  return { data, loading, load };
}
