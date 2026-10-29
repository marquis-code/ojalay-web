import { BaseApi } from '~/api/base/BaseApi';
import type { MarketplaceMine } from '~/types';

class MarketplaceApi extends BaseApi {
  constructor() { super('/marketplace'); }
  mine(): Promise<MarketplaceMine> { return this.request('get', '/mine'); }
}
export const marketplaceApi = new MarketplaceApi();
