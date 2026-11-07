import { BaseApi } from '~/api/base/BaseApi';
import type { SupportChatMessage, SupportThread } from '~/types';

class SupportApi extends BaseApi {
  constructor() { super('/support/conversations'); }
  start(payload: { name: string; email: string; phone: string }): Promise<SupportThread> { return this.request('post', '', payload); }
  thread(token: string): Promise<SupportThread> { return this.request('get', `/${token}`); }
  send(token: string, body: string): Promise<SupportChatMessage> { return this.request('post', `/${token}/messages`, { body }); }
}
export const supportApi = new SupportApi();
