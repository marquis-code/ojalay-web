<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
const faqs = [
  { q: 'What is Ojaly now?', a: 'Ojaly is a local service marketplace and booking record. Customers discover verified service businesses across Lagos — including UNILAG and CMUL — book a real time and pay securely. The business gets the customer, deposit, receipt and review in the same transaction.' },
  { q: 'Who is it for?', a: 'Anyone who wants trusted hair, food, nails, printing, laundry, design, repair and tutoring services. Service businesses that want demand and a booking system — campus and community. Product sellers can still use Ojaly, but the marketplace is built for services first.' },
  { q: 'How do I know the businesses are real?', a: 'A business must be reviewed by the Ojaly team before it appears. Verified listings show a badge, reviews only come from completed appointments, and every payment gets a receipt.' },
  { q: 'How does payment work?', a: 'Payments go through Paystack directly to the business. Ojaly records the booking, deposit, receipt and remaining balance. We do not hold your money.' },
  { q: 'I already sell on WhatsApp. Why use Ojaly?', a: 'Keep WhatsApp for conversation. Use Ojaly for discovery, real availability, deposits, receipts and records. Send the link in WhatsApp instead of typing prices and times forever.' },
  { q: 'Do I need the WhatsApp API?', a: 'No. Ojaly works with shareable WhatsApp links, email and SMS fallback. WhatsApp automation is optional. Cloud API review will never block you from booking or getting paid.' },
  { q: 'What if a day is fully booked?', a: 'Join the waitlist. If a customer cancels or reschedules, Ojaly offers the opening to waiting customers by email and WhatsApp.' },
  { q: 'Can I reschedule or cancel?', a: 'Yes. Every booking has a private management link. Reschedule or cancel within the business policy window; deposits and cancellation rules are shown upfront.' },
  { q: 'Is it free?', a: 'Students browse and book for free. Service businesses start free and can upgrade when they need more staff, packages or advanced tools. No card is required to start.' },
  { q: 'Where is Ojaly available?', a: 'Lagos first. Campus communities UNILAG and CMUL are launch filters, not requirements. Any trusted local service provider — campus or community — can apply for verification.' },
];
const open = ref<number | null>(0);
</script>

<template>
  <section id="faq" class="border-b border-line bg-surface py-16 sm:py-24">
    <div class="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p class="eyebrow">Questions</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em]">Ask us anything.</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">Straight answers, no jargon. Still unsure? Message us on WhatsApp and a human will reply.</p>
        <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-forest-900 px-4 py-3 text-sm font-bold text-white">Chat with a human →</a>
      </div>
      <div class="divide-y divide-line rounded-3xl border border-line bg-canvas px-5 sm:px-7">
        <div v-for="(faq, index) in faqs" :key="faq.q" class="py-1">
          <button type="button" class="flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left" :aria-expanded="open === index" @click="open = open === index ? null : index">
            <span class="text-sm font-bold sm:text-[15px]">{{ faq.q }}</span>
            <Plus class="h-5 w-5 shrink-0 text-brand-500 transition duration-300" :class="open === index ? 'rotate-45' : ''" />
          </button>
          <div class="grid transition-all duration-300" :class="open === index ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'">
            <p class="overflow-hidden text-[13px] leading-relaxed text-muted">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
