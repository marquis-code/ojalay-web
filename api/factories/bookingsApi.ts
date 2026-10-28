import { BaseApi } from '~/api/base/BaseApi';
import type { AvailabilityResponse, Booking, BookingListResponse } from '~/types';

class BookingsApi extends BaseApi {
  constructor() { super('/bookings'); }
  listBookings(params: { date?: string; from?: string; to?: string; status?: string; providerId?: string; serviceId?: string; search?: string; page?: number; limit?: number } = {}): Promise<BookingListResponse> {
    return this.request('get', '', undefined, params as Record<string, unknown>);
  }
  availability(params: { serviceId: string; date: string; providerId?: string }): Promise<AvailabilityResponse> {
    return this.request('get', '/availability', undefined, params as Record<string, unknown>);
  }
  booking(id: string): Promise<Booking> { return this.request('get', `/${id}`); }
  createBooking(payload: Record<string, unknown>): Promise<Booking> { return this.request('post', '', payload); }
  setStatus(id: string, status: string, reason?: string): Promise<Booking> { return this.request('patch', `/${id}/status`, { status, reason }); }
  cancel(id: string, reason?: string): Promise<Booking> { return this.request('post', `/${id}/cancel`, { reason }); }
  reschedule(id: string, startAt: string, providerId?: string): Promise<Booking> { return this.request('post', `/${id}/reschedule`, { startAt, providerId }); }
}

export const bookingsApi = new BookingsApi();
