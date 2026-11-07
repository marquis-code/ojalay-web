import { bookingMessagesApi } from '~/api/factories/bookingMessagesApi';
import type { BookingMessageInboxItem, BookingMessageThread } from '~/types';

export function useBookingMessages() {
  const inbox = ref<BookingMessageInboxItem[]>([]);
  const thread = ref<BookingMessageThread | null>(null);
  const loading = ref(false);
  const sending = ref(false);
  async function loadInbox() { loading.value = true; try { inbox.value = await bookingMessagesApi.inbox(); } finally { loading.value = false; } }
  async function open(bookingId: string) { loading.value = true; try { thread.value = await bookingMessagesApi.thread(bookingId); const item = inbox.value.find((entry) => entry.bookingId === bookingId); if (item) item.unread = 0; } finally { loading.value = false; } }
  async function send(payload: { body?: string; attachments?: string[] }) {
    if (!thread.value) return;
    sending.value = true;
    try { await bookingMessagesApi.send(thread.value.booking.id, payload); await open(thread.value.booking.id); await loadInbox(); }
    finally { sending.value = false; }
  }
  return { inbox, thread, loading, sending, loadInbox, open, send };
}
