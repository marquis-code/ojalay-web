import { BaseApi } from '~/api/base/BaseApi';
import type { PayrollRun } from '~/types';

class PayrollApi extends BaseApi {
  constructor() { super('/payroll'); }
  runs(): Promise<PayrollRun[]> { return this.request('get', '/runs'); }
  run(id: string): Promise<PayrollRun> { return this.request('get', `/runs/${id}`); }
  generate(frequency: 'daily' | 'weekly' | 'monthly' | 'per_service', period: string): Promise<PayrollRun> { return this.request('post', '/runs', { frequency, period }); }
  updateItem(runId: string, providerId: string, payload: { adjustmentKobo?: number; deductionKobo?: number; note?: string }): Promise<PayrollRun> {
    return this.request('patch', `/runs/${runId}/items/${providerId}`, payload);
  }
  approve(id: string): Promise<PayrollRun> { return this.request('post', `/runs/${id}/approve`); }
  pay(id: string): Promise<PayrollRun> { return this.request('post', `/runs/${id}/pay`); }
  verify(id: string): Promise<PayrollRun> { return this.request('post', `/runs/${id}/verify`); }
  cancel(id: string): Promise<PayrollRun> { return this.request('post', `/runs/${id}/cancel`); }
}
export const payrollApi = new PayrollApi();
