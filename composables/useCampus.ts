import { publicApi } from '~/api/factories/publicApi';

export function useCampusOverview() {
  return useAsyncData('campus-overview', () => publicApi.campus(), { server: true });
}
export function useCampusApplication() {
  const saving = ref(false);
  const error = ref<string | null>(null);
  async function apply(payload: { name: string; phone: string; email?: string; campusCode: string; year?: string; socials?: string; why?: string }) {
    saving.value = true; error.value = null;
    try { return await publicApi.applyCampus(payload); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { saving.value = false; }
  }
  return { saving, error, apply };
}
