import { BaseApi } from '~/api/base/BaseApi';
import type { CustomRequest, CustomRequestQuote } from '~/types';

class CustomRequestsApi extends BaseApi {
  constructor() { super('/custom-requests'); }
  listRequests(): Promise<CustomRequest[]> { return this.request('get', ''); }
  getRequest(id: string): Promise<CustomRequest> { return this.request('get', `/${id}`); }
  quote(id: string, payload: { items: { label: string; amountKobo: number }[]; durationMinutes: number; depositKobo: number; startAt?: string; slots?: string[]; providerId?: string; note?: string; expiresInHours?: number; serviceKobo?: number; hairKobo?: number; addOnKobo?: number }): Promise<CustomRequest> {
    return this.request('post', `/${id}/quote`, payload);
  }
  message(id: string, body: string): Promise<CustomRequest> { return this.request('post', `/${id}/messages`, { body }); }
  decline(id: string, reason?: string): Promise<CustomRequest> { return this.request('post', `/${id}/decline`, { reason }); }
  createPublic(slug: string, payload: Record<string, unknown>): Promise<CustomRequest> { return this.request('post', `/public/${slug}`, payload); }
  byToken(token: string): Promise<CustomRequest> { return this.request('get', `/public/${token}`); }
  messagePublic(token: string, body: string): Promise<CustomRequest> { return this.request('post', `/public/${token}/messages`, { body }); }
  accept(token: string, startAt?: string): Promise<{ request: CustomRequest; booking: { id: string; publicToken: string; bookingNumber: string } }> { return this.request('post', `/public/${token}/accept`, startAt ? { startAt } : {}); }
}
export const customRequestsApi = new CustomRequestsApi();
