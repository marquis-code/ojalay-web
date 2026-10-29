<script setup lang="ts">
useSeoMeta({
  title: 'Ojaly — book trusted local service businesses in Lagos',
  description: 'Discover verified local service businesses across Lagos — campus and non-campus. Book a real time, pay securely and get a receipt. For service businesses: demand, deposits and a trusted booking record.',
  ogTitle: 'Ojaly — book trusted local service businesses.',
  ogDescription: 'A verified local marketplace and booking record for service businesses in Lagos — campus and non-campus.',
  ogType: 'website',
  ogUrl: 'https://ojaly.org',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: 'https://ojaly.org' }, { rel: 'preload', as: 'image', href: '/images/business/market-trader.webp', fetchpriority: 'high' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Ojaly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Local service marketplace and booking record for verified providers in Lagos.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    }),
  }],
});
definePageMeta({ layout: 'default' });
</script>

<template>
  <div>
    <LandingHero />
    <PainPoints />
    <HowItWorks />
    <FeatureGrid />
    <PricingSection />
    <FaqSection />
    <FinalCta />
  </div>
</template>
