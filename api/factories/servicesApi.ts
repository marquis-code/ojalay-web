import { BaseApi } from '~/api/base/BaseApi';
import type { Service } from '~/types';

export type ServicePayload = Omit<Service, 'id' | 'isActive' | 'isPublic'> & {
  isActive?: boolean; isPublic?: boolean;
};

class ServicesApi extends BaseApi {
  constructor() { super('/services'); }
  listServices(includeInactive = true): Promise<Service[]> {
    return this.request('get', '', undefined, { includeInactive: String(includeInactive) });
  }
  categories(): Promise<string[]> { return this.request('get', '/categories'); }
  createService(payload: Partial<ServicePayload>): Promise<Service> { return this.request('post', '', payload); }
  updateService(id: string, payload: Partial<ServicePayload>): Promise<Service> { return this.request('patch', `/${id}`, payload); }
  removeService(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/${id}`); }
}

export const servicesApi = new ServicesApi();
