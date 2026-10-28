import { BaseApi } from '~/api/base/BaseApi';
import type { AvailabilityResponse, Booking, Invoice, Order, PublicProvider, PublicReview, Receipt, Review, ReviewContext, Service, StorefrontHome, StorefrontProduct, StorefrontTemplate, WaitlistEntry, PackagePurchase, ServicePackage, CampusOverview, CampusApplication } from '~/types';

class PublicApi extends BaseApi {
  constructor() { super('/'); }
  storefrontHome(slug: string): Promise<StorefrontHome> { return this.request('get', `storefront/${slug}`); }
  storefrontByDomain(domain: string): Promise<StorefrontHome> { return this.request('get', `storefront/domain/${domain}`); }
  products(slug: string, params: { page?: number; limit?: number; search?: string; category?: string } = {}): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; items: StorefrontProduct[]; meta: { total: number; page: number; limit: number; pages: number } }> {
    return this.request('get', `storefront/${slug}/products`, undefined, params as Record<string, unknown>);
  }
  product(slug: string, id: string): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; product: StorefrontProduct; related: StorefrontProduct[] }> {
    return this.request('get', `storefront/${slug}/products/${id}`);
  }
  placeOrder(slug: string, payload: {
    customerName: string; customerPhone: string; customerEmail?: string; deliveryAddress?: string; deliveryDetails?: string;
    notes?: string; items: { productId: string; variantId?: string; quantity: number }[]; payOnline?: boolean;
  }): Promise<{ order: Order; orderToken: string; whatsappUrl: string | null; whatsappMessage: string; payment: { authorizationUrl: string; reference: string } | null }> {
    return this.request('post', `storefront/${slug}/orders`, payload);
  }
  services(slug: string): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; items: Service[]; providers: PublicProvider[]; categories: string[] }> {
    return this.request('get', `storefront/${slug}/services`);
  }
  service(slug: string, id: string): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; service: Service; providers: PublicProvider[]; packages: ServicePackage[]; reviews: { items: PublicReview[]; average: number; count: number } }> {
    return this.request('get', `storefront/${slug}/services/${id}`);
  }
  availability(slug: string, params: { serviceId: string; date: string; providerId?: string; durationMinutes?: number }): Promise<AvailabilityResponse> {
    return this.request('get', `storefront/${slug}/availability`, undefined, params as Record<string, unknown>);
  }
  book(slug: string, payload: { serviceId: string; providerId?: string; startAt: string; customerName: string; customerPhone: string; customerEmail?: string; notes?: string; addOnNames?: string[]; packageCode?: string }): Promise<{ booking: Booking; business: StorefrontHome['business']; payment: { authorizationUrl: string; reference: string; amountKobo: number } | null; whatsappUrl: string | null; whatsappMessage: string }> {
    return this.request('post', `storefront/${slug}/bookings`, payload);
  }
  campus(): Promise<CampusOverview> { return this.request('get', 'campus'); }
  applyCampus(payload: { name: string; phone: string; email?: string; campusCode: string; year?: string; socials?: string; why?: string }): Promise<{ application: CampusApplication; already?: boolean }> { return this.request('post', 'campus/apply', payload); }
  reviewContext(token: string): Promise<ReviewContext> { return this.request('get', `public/reviews/${token}`); }
  submitReview(token: string, payload: { rating: number; comment?: string }): Promise<Review> { return this.request('post', `public/reviews/${token}`, payload); }
  packages(slug: string): Promise<{ business: StorefrontHome['business']; template: StorefrontTemplate; items: ServicePackage[] }> { return this.request('get', `storefront/${slug}/packages`); }
  checkoutPackage(slug: string, packageId: string, payload: { customerName: string; customerPhone: string; customerEmail?: string }): Promise<{ purchase: PackagePurchase; payment: { authorizationUrl: string; reference: string; amountKobo: number }; business: StorefrontHome['business'] }> {
    return this.request('post', `storefront/${slug}/packages/${packageId}/checkout`, payload);
  }
  payPackage(token: string, email?: string): Promise<{ authorizationUrl: string; reference: string; amountKobo: number }> { return this.request('post', `public/payments/package/${token}`, { email }); }
  packagePurchase(token: string): Promise<{ purchase: PackagePurchase; package: ServicePackage | null; business: Record<string, unknown> | null }> { return this.request('get', `public/packages/${token}`); }
  joinWaitlist(slug: string, payload: { serviceId: string; providerId?: string; customerName: string; customerPhone: string; customerEmail?: string; preferredFrom: string; preferredTo: string; preferredStartAt?: string; notes?: string }): Promise<{ entry: WaitlistEntry & { already?: boolean }; business: StorefrontHome['business'] }> {
    return this.request('post', `storefront/${slug}/waitlist`, payload);
  }
  booking(token: string): Promise<{ booking: Booking; business: Record<string, unknown> | null }> { return this.request('get', `public/bookings/${token}`); }
  cancelBooking(token: string, reason?: string): Promise<{ cancelled: boolean; booking: Booking }> { return this.request('post', `public/bookings/${token}/cancel`, { reason }); }
  rescheduleBooking(token: string, startAt: string, providerId?: string): Promise<Booking> { return this.request('post', `public/bookings/${token}/reschedule`, { startAt, providerId }); }
  payBooking(token: string, email?: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> { return this.request('post', `public/payments/booking/${token}`, { email }); }
  contact(slug: string, payload: { name: string; phone: string; email?: string; message: string }): Promise<{ sent: boolean; whatsappUrl: string }> {
    return this.request('post', `storefront/${slug}/contact`, payload);
  }
  embed(slug: string): Promise<{ business: StorefrontHome['business']; orderLink: string; currency: string }> { return this.request('get', `storefront/${slug}/embed`); }
  receipt(token: string): Promise<{ receipt: Receipt; business: Record<string, unknown> }> { return this.request('get', `public/receipts/${token}`); }
  invoice(token: string): Promise<{ invoice: Invoice; business: Record<string, unknown> }> { return this.request('get', `public/invoices/${token}`); }
  order(token: string): Promise<{ order: Order; business: Record<string, unknown> }> { return this.request('get', `public/orders/${token}`); }
  debt(token: string): Promise<{ debt: Record<string, unknown>; business: Record<string, unknown>; paystackConfigured: boolean; publicKey?: string | null }> {
    return this.request('get', `public/payments/debt/${token}`);
  }
  payDebt(token: string, email: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/debt/${token}`, { email });
  }
  payOrder(token: string, email?: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/order/${token}`, { email });
  }
  payInvoice(token: string, email?: string): Promise<{ reference: string; authorizationUrl: string; amountKobo: number }> {
    return this.request('post', `public/payments/invoice/${token}`, { email });
  }
  verifyPayment(reference: string): Promise<{ status: string; payment: Record<string, unknown> }> {
    return this.request('get', `payments/verify/${reference}`);
  }
  paymentConfig(): Promise<{ configured: boolean; publicKey?: string | null }> { return this.request('get', 'payments/config'); }
}
export const publicApi = new PublicApi();
