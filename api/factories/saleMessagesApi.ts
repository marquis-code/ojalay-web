import { BaseApi } from '~/api/base/BaseApi';
import type { SaleChatMessage, SaleChatThread, SupportAttachment } from '~/types';

export class SaleMessagesApi extends BaseApi {
  constructor() { super('/sale-messages'); }
  inbox() { return this.request<Record<string, unknown>[]>('get', '/inbox'); }
  thread(saleId: string): Promise<SaleChatThread> { return this.request('get', `/${saleId}`); }
  send(saleId: string, body: string, attachments?: SupportAttachment[]): Promise<SaleChatMessage> { return this.request('post', `/${saleId}`, { body, attachments }); }
  read(saleId: string) { return this.request('post', `/${saleId}/read`); }
}

export class PublicSaleMessagesApi extends BaseApi {
  constructor() { super('/public/sale-messages'); }
  thread(token: string): Promise<SaleChatThread> { return this.request('get', `/${token}`); }
  send(token: string, body: string, attachments?: SupportAttachment[]): Promise<SaleChatMessage> { return this.request('post', `/${token}`, { body, attachments }); }
  read(token: string) { return this.request('post', `/${token}/read`); }
}

export const saleMessagesApi = new SaleMessagesApi();
export const publicSaleMessagesApi = new PublicSaleMessagesApi();
