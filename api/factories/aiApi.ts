import { BaseApi } from '~/api/base/BaseApi';

class AiApi extends BaseApi {
  constructor() { super('/ai'); }
  productDescription(payload: { name: string; category?: string; imageUrl?: string; priceKobo?: number }): Promise<{ description: string; tags: string[]; usedAi: boolean }> {
    return this.request('post', '/product-description', payload);
  }
}
export const aiApi = new AiApi();
