import { analyticsApi } from '~/api/factories/analyticsApi';
import type { StorefrontAnalytics } from '~/types';

export function useStorefrontAnalytics(initialRange: 'today' | '7d' | '30d' | '90d' = '30d') {
  const data = ref<StorefrontAnalytics | null>(null);
  const loading = ref(false);
  const error = ref('');
  const range = ref(initialRange);
  async function load(next = range.value) {
    range.value = next; loading.value = true; error.value = '';
    try { data.value = await analyticsApi.storefront(next); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  return { data, loading, error, range, load };
}
