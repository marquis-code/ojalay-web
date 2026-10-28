import { publicApi } from '~/api/factories/publicApi';
import type { AvailabilityResponse, Booking } from '~/types';

export function usePublicBookingFlow(slug: string) {
  const availability = ref<AvailabilityResponse | null>(null);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);
  const waitlistLoading = ref(false);
  const waitlistJoined = ref(false);
  const confirmed = ref<{ booking: Booking; whatsappUrl: string | null; payment: { authorizationUrl: string; reference: string; amountKobo: number } | null } | null>(null);

  async function loadAvailability(serviceId: string, date: string, providerId?: string, durationMinutes?: number) {
    loading.value = true; error.value = null;
    try { availability.value = await publicApi.availability(slug, { serviceId, date, providerId, durationMinutes }); }
    catch (err) { error.value = (err as Error).message; availability.value = null; }
    finally { loading.value = false; }
  }
  async function joinWaitlist(payload: { serviceId: string; providerId?: string; customerName: string; customerPhone: string; customerEmail?: string; preferredFrom: string; preferredTo: string; preferredStartAt?: string; notes?: string }) {
    waitlistLoading.value = true; error.value = null;
    try { await publicApi.joinWaitlist(slug, payload); waitlistJoined.value = true; }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { waitlistLoading.value = false; }
  }
  async function book(payload: Parameters<typeof publicApi.book>[1]) {
    submitting.value = true; error.value = null;
    try {
      const result = await publicApi.book(slug, payload);
      confirmed.value = { booking: result.booking, whatsappUrl: result.whatsappUrl, payment: result.payment };
      return result;
    } catch (err) { error.value = (err as Error).message; throw err; }
    finally { submitting.value = false; }
  }
  return { availability, loading, submitting, waitlistLoading, waitlistJoined, error, confirmed, loadAvailability, joinWaitlist, book };
}
