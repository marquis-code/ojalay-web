import { BaseApi } from '~/api/base/BaseApi';
import type { PackagePurchase, ServicePackage } from '~/types';

class PackagesApi extends BaseApi {
  constructor() { super('/packages'); }
  listPackages(): Promise<ServicePackage[]> { return this.request('get', ''); }
  listPurchases(): Promise<PackagePurchase[]> { return this.request('get', '/purchases'); }
  createPackage(payload: Record<string, unknown>): Promise<ServicePackage> { return this.request('post', '', payload); }
  updatePackage(id: string, payload: Record<string, unknown>): Promise<ServicePackage> { return this.request('patch', `/${id}`, payload); }
  removePackage(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/${id}`); }
}
export const packagesApi = new PackagesApi();
