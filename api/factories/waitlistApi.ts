import { BaseApi } from '~/api/base/BaseApi';
import type { WaitlistEntry } from '~/types';

class WaitlistApi extends BaseApi {
  constructor() { super('/waitlist'); }
  listEntries(status = 'all'): Promise<WaitlistEntry[]> {
    return this.request('get', '', undefined, { status });
  }
  notify(id: string): Promise<WaitlistEntry> { return this.request('post', `/${id}/notify`); }
  setStatus(id: string, status: WaitlistEntry['status']): Promise<WaitlistEntry> { return this.request('patch', `/${id}`, { status }); }
  removeEntry(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/${id}`); }
}

export const waitlistApi = new WaitlistApi();
