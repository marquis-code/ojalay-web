import { BaseApi } from '~/api/base/BaseApi';
import type { Provider } from '~/types';

class ProvidersApi extends BaseApi {
  constructor() { super('/providers'); }
  listProviders(): Promise<Provider[]> { return this.request('get', ''); }
  createProvider(payload: Partial<Provider>): Promise<Provider> { return this.request('post', '', payload); }
  updateProvider(id: string, payload: Partial<Provider>): Promise<Provider> { return this.request('patch', `/${id}`, payload); }
  removeProvider(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/${id}`); }
}

export const providersApi = new ProvidersApi();
