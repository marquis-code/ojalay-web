import { BaseApi } from '~/api/base/BaseApi';
import type { StorefrontChatConversation, StorefrontChatMessage, StorefrontChatThread } from '~/types';

export class StorefrontChatApi extends BaseApi {
  constructor() { super('/storefront-chats'); }
  conversations() { return this.request<StorefrontChatConversation[]>('get', ''); }
  thread(id: string): Promise<StorefrontChatThread> { return this.request('get', `/${id}`); }
  reply(id: string, body: string): Promise<StorefrontChatMessage> { return this.request('post', `/${id}/messages`, { body }); }
  close(id: string) { return this.request('post', `/${id}/close`); }
}
export class PublicStorefrontChatApi extends BaseApi {
  constructor() { super('/public/storefront-chats'); }
  start(businessId: string, payload: { name: string; phone: string; email?: string; contextType?: string; contextId?: string; contextName?: string }): Promise<StorefrontChatThread & { token: string }> { return this.request('post', `/business/${businessId}`, payload); }
  thread(token: string): Promise<StorefrontChatThread> { return this.request('get', `/${token}`); }
  send(token: string, body: string): Promise<StorefrontChatMessage> { return this.request('post', `/${token}/messages`, { body }); }
}
export const storefrontChatApi = new StorefrontChatApi();
export const publicStorefrontChatApi = new PublicStorefrontChatApi();
