<script setup lang="ts">
useSeoMeta({
  title: 'Ojaly — sell products, offer services, get paid.',
  description: 'Ojaly is the business platform for local businesses. Sell products, offer services, take bookings and payments, issue receipts and keep your customers and records in one place.',
  ogTitle: 'Ojaly — sell products, offer services, get paid.',
  ogDescription: 'Sell products, offer services, take bookings and get paid with one connected business record.',
  ogType: 'website',
  ogUrl: 'https://ojaly.org',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: 'https://ojaly.org' }, { rel: 'preload', as: 'image', href: '/images/business/campus-food.jpg', fetchpriority: 'high' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Ojaly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Business platform for local businesses: sell products, offer services, take bookings, get paid and keep one connected record.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    }),
  }],
});
definePageMeta({ layout: 'default' });
</script>

<template>
  <div>
    <PlatformPromoBar />
    <LandingHero />
    <FeaturedBusinesses />
    <SupportChatWidget />
    <PainPoints />
    <HowItWorks />
    <FeatureGrid />
    <PricingSection />
    <FaqSection />
    <FinalCta />
  </div>
</template>
