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
  const config = useRuntimeConfig();
  const busy = ref(false);
  const error = ref<string | null>(null);
  async function cancel(reason?: string) { busy.value = true; error.value = null; try { return await publicApi.cancelBooking(toValue(token), reason); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  async function reschedule(startAt: string, providerId?: string) { busy.value = true; error.value = null; try { return await publicApi.rescheduleBooking(toValue(token), startAt, providerId); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  async function availability(slug: string, serviceId: string, date: string) { return publicApi.availability(slug, { serviceId, date }); }
  function calendarUrl() { return `${String(config.public.apiBase).replace(/\/$/, '')}/public/bookings/${toValue(token)}/calendar.ics`; }
  async function pay(email?: string) { busy.value = true; error.value = null; try { return await publicApi.payBooking(toValue(token), email); } catch (err) { error.value = (err as Error).message; throw err; } finally { busy.value = false; } }
  return { busy, error, cancel, reschedule, pay, availability, calendarUrl };
}

export function usePublicReview(token: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `public-review-${toValue(token)}`,
    () => publicApi.reviewContext(toValue(token)),
    { watch: [() => toValue(token)] },
  );
}
export function useReviewActions(token: MaybeRefOrGetter<string>) {
  const busy = ref(false);
  const error = ref<string | null>(null);
  async function submit(rating: number, comment: string) {
    busy.value = true; error.value = null;
    try { return await publicApi.submitReview(toValue(token), { rating, comment }); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { busy.value = false; }
  }
  return { busy, error, submit };
}

export function useStorefrontPackages(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `storefront-packages-${toValue(slug)}`,
    () => publicApi.packages(toValue(slug)),
    { watch: [() => toValue(slug)] },
  );
}
export function usePackagePurchase(token: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `package-purchase-${toValue(token)}`,
    () => publicApi.packagePurchase(toValue(token)),
    { watch: [() => toValue(token)] },
  );
}

export function usePackageCheckout(slug: MaybeRefOrGetter<string>) {
  const saving = ref(false);
  const error = ref<string | null>(null);
  async function checkout(packageId: string, payload: { customerName: string; customerPhone: string; customerEmail?: string }) {
    saving.value = true; error.value = null;
    try { return await publicApi.checkoutPackage(toValue(slug), packageId, payload); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { saving.value = false; }
  }
  return { saving, error, checkout };
}
export function usePackagePayments() {
  const busy = ref(false);
  async function payPackage(token: string, email?: string) { busy.value = true; try { return await publicApi.payPackage(token, email); } finally { busy.value = false; } }
  return { busy, payPackage };
}
