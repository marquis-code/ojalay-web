import { publicApi } from '~/api/factories/publicApi';

export function useStorefrontServices(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `storefront-services-${toValue(slug)}`,
    () => publicApi.services(toValue(slug)),
    { watch: [() => toValue(slug)] },
  );
}
export function useStorefrontService(slug: MaybeRefOrGetter<string>, id: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `storefront-service-${toValue(slug)}-${toValue(id)}`,
    () => publicApi.service(toValue(slug), toValue(id)),
    { watch: [() => toValue(slug), () => toValue(id)] },
  );
}
export function usePublicBooking(token: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `public-booking-${toValue(token)}`,
    () => publicApi.booking(toValue(token)),
    { watch: [() => toValue(token)] },
  );
}

export function usePublicBookingActions(token: MaybeRefOrGetter<string>) {
  const busy = ref(false);
  const error = ref<string | null>(null);
  async function cancel(reason?: string) { busy.value = true; error.value = null; try { return await publicApi.cancelBooking(toValue(token), reason); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  async function reschedule(startAt: string, providerId?: string) { busy.value = true; error.value = null; try { return await publicApi.rescheduleBooking(toValue(token), startAt, providerId); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  async function availability(slug: string, serviceId: string, date: string) { return publicApi.availability(slug, { serviceId, date }); }
  async function pay(email?: string) { busy.value = true; error.value = null; try { return await publicApi.payBooking(toValue(token), email); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  return { busy, error, cancel, reschedule, pay, availability };
}
