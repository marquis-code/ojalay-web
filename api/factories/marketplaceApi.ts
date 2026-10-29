import { BaseApi } from '~/api/base/BaseApi';
import type { MarketplaceMine } from '~/types';

class MarketplaceApi extends BaseApi {
  constructor() { super('/marketplace'); }
  mine(): Promise<MarketplaceMine> { return this.request('get', '/mine'); }
  requestVerification(): Promise<{ requested: boolean; message: string }> { return this.request('post', '/request-verification'); }
}
export const marketplaceApi = new MarketplaceApi();
