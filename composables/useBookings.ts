import { bookingsApi } from '~/api/factories/bookingsApi';
import type { AvailabilityResponse, Booking } from '~/types';

export function useBookings() {
  const items = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const summary = reactive({ today: 0, upcoming: 0, pending: 0 });
  const filters = reactive({ date: new Date().toISOString().slice(0, 10), status: 'all', providerId: '' });
  const slots = ref<AvailabilityResponse | null>(null);
  const slotsLoading = ref(false);

  async function load() {
    loading.value = true; error.value = null;
    try {
      const result = await bookingsApi.listBookings({
        date: filters.date || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        providerId: filters.providerId || undefined,
      });
      items.value = result.items;
      Object.assign(summary, result.summary);
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function loadSlots(serviceId: string, date: string, providerId?: string) {
    slotsLoading.value = true; slots.value = null;
    try { slots.value = await bookingsApi.availability({ serviceId, date, providerId: providerId || undefined }); }
    finally { slotsLoading.value = false; }
  }
  async function create(payload: Record<string, unknown>) { const b = await bookingsApi.createBooking(payload); await load(); return b; }
  async function calendarFeed() { return bookingsApi.calendarFeed(); }
  async function roster(id: string) { return bookingsApi.roster(id); }
  async function createRecurring(payload: Record<string, unknown>) { const result = await bookingsApi.createRecurring(payload); await load(); return result; }
  async function setStatus(id: string, status: string, reason?: string) { const b = await bookingsApi.setStatus(id, status, reason); await load(); return b; }
  async function cancel(id: string, reason?: string) { const b = await bookingsApi.cancel(id, reason); await load(); return b; }
  async function refund(id: string, amountKobo?: number) { const result = await bookingsApi.refund(id, amountKobo); await load(); return result; }
  async function reschedule(id: string, startAt: string, providerId?: string) { const b = await bookingsApi.reschedule(id, startAt, providerId); await load(); return b; }
  return { items, loading, error, summary, filters, slots, slotsLoading, load, loadSlots, create, createRecurring, calendarFeed, roster, setStatus, cancel, refund, reschedule };
}
