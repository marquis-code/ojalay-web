import { BaseApi } from '~/api/base/BaseApi';
import type { StorefrontAnalytics } from '~/types';

export class AnalyticsApi extends BaseApi {
  constructor() { super('/analytics'); }
  storefront(range: 'today' | '7d' | '30d' | '90d' = '30d'): Promise<StorefrontAnalytics> {
    return this.request('get', '/storefront', undefined, { range });
  }
}
export const analyticsApi = new AnalyticsApi();
