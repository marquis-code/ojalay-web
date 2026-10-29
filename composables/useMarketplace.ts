import { publicApi } from '~/api/factories/publicApi';
import type { MarketplaceBusiness, MarketplaceResponse } from '~/types';

export function useMarketplace() {
  const data = ref<MarketplaceResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const campus = ref('UNILAG');
  const category = ref('');
  const query = ref('');
  async function load() {
    loading.value = true; error.value = null;
    try { data.value = await publicApi.marketplace({ campus: campus.value || undefined, category: category.value || undefined, q: query.value || undefined }); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  function open(business: MarketplaceBusiness) {
    const campusCode = business.campusCode || campus.value;
    return `/s/${business.slug}/services?marketplace=1&campus=${campusCode}`;
  }
  return { data, loading, error, campus, category, query, load, open };
}
