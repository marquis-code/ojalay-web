interface StorefrontChatContext { type: 'product' | 'service' | 'general'; id?: string; name?: string }

export function useStorefrontChat() {
  const open = useState('storefront-chat-open', () => false);
  const context = useState<StorefrontChatContext | null>('storefront-chat-context', () => null);
  function openChat(next?: StorefrontChatContext) { context.value = next || null; open.value = true; }
  function closeChat() { open.value = false; }
  return { open, context, openChat, closeChat };
}
