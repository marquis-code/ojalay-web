import { BaseApi } from '~/api/base/BaseApi';
import type { BookingMessage, BookingMessageInboxItem, BookingMessageThread } from '~/types';

class BookingMessagesApi extends BaseApi {
  constructor() { super('/booking-messages'); }
  inbox(): Promise<BookingMessageInboxItem[]> { return this.request('get', '/inbox'); }
  thread(bookingId: string): Promise<BookingMessageThread> { return this.request('get', `/${bookingId}`); }
  send(bookingId: string, payload: { body?: string; attachments?: string[] }): Promise<BookingMessage> { return this.request('post', `/${bookingId}`, payload); }
  markRead(bookingId: string): Promise<{ read: boolean }> { return this.request('post', `/${bookingId}/read`); }
}

export class PublicBookingMessagesApi extends BaseApi {
  constructor() { super('/public/booking-messages'); }
  thread(token: string): Promise<BookingMessageThread> { return this.request('get', `/${token}`); }
  send(token: string, payload: { body?: string; attachments?: string[] }): Promise<BookingMessage> { return this.request('post', `/${token}`, payload); }
  markRead(token: string): Promise<{ read: boolean }> { return this.request('post', `/${token}/read`); }
}
export const bookingMessagesApi = new BookingMessagesApi();
export const publicBookingMessagesApi = new PublicBookingMessagesApi();
