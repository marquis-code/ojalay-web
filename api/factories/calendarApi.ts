import { BaseApi } from '~/api/base/BaseApi';

export interface CalendarStatus {
  configured: { google: boolean; outlook: boolean };
  connections: { provider: 'google' | 'outlook'; calendarId: string; connectedAt: string; lastSyncAt?: string | null; isActive: boolean }[];
}
class CalendarApi extends BaseApi {
  constructor() { super('/calendar'); }
  status(): Promise<CalendarStatus> { return this.request('get', '/connections'); }
  connect(provider: 'google' | 'outlook'): Promise<{ url: string }> { return this.request('get', `/${provider}/connect`); }
  sync(): Promise<{ synced: number; connections: number }> { return this.request('post', '/sync'); }
  disconnect(provider: 'google' | 'outlook'): Promise<{ disconnected: boolean }> { return this.request('delete', `/${provider}`); }
}
export const calendarApi = new CalendarApi();
