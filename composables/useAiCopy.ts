import { aiApi } from '~/api/factories/aiApi';

export function useAiCopy() {
  const generating = ref(false);
  const error = ref<string | null>(null);
  async function productDescription(payload: { name: string; category?: string; imageUrl?: string; priceKobo?: number }) {
    generating.value = true; error.value = null;
    try { return await aiApi.productDescription(payload); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { generating.value = false; }
  }
  return { generating, error, productDescription };
}
