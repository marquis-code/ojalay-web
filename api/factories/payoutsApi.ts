import { BaseApi } from '~/api/base/BaseApi';
export interface WithdrawalRequestView { id: string; amountKobo: number; status: string; bankName: string; accountNumber: string; accountName: string; note: string; adminNote: string; reference: string | null; createdAt: string; processedAt: string | null; }
export interface PayoutSummary { earnedKobo: number; availableKobo: number; pendingKobo: number; paidKobo: number; completedBookings: number; waitlistKobo: number; waitlistCount: number; settlementAccount: { id: string; bankName: string; accountNumber: string; accountName: string } | null; requests: WithdrawalRequestView[]; }
class PayoutsApi extends BaseApi {
  constructor() { super('/payouts'); }
  summary(): Promise<PayoutSummary> { return this.request('get', ''); }
  requestWithdrawal(payload: { amountKobo: number; note?: string }): Promise<WithdrawalRequestView> { return this.request('post', '/request', payload); }
}
export const payoutsApi = new PayoutsApi();
