import { reviewsApi } from '~/api/factories/reviewsApi';
import type { Review, ReviewSummary } from '~/types';

export function useReviews() {
  const items = ref<Review[]>([]);
  const summary = reactive<ReviewSummary>({ total: 0, average: 0, fiveStar: 0, needsAttention: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref('all');

  async function load() {
    loading.value = true; error.value = null;
    try {
      const result = await reviewsApi.listReviews(filter.value);
      items.value = result.items;
      Object.assign(summary, result.summary);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function setStatus(id: string, status: Review['status']) { const review = await reviewsApi.setStatus(id, status); await load(); return review; }
  async function remove(id: string) { await reviewsApi.removeReview(id); await load(); }
  return { items, summary, loading, error, filter, load, setStatus, remove };
}
