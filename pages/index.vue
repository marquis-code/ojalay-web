<script setup lang="ts">
const { data: plans } = await usePublicPlans();
useSeoMeta({
  title: 'Ojaly — book trusted student businesses at UNILAG and CMUL',
  description: 'Discover verified student service businesses at UNILAG and CMUL. Book a real time, pay securely and get a receipt. For service businesses: demand, deposits and a trusted booking record.',
  ogTitle: 'Ojaly — book trusted student businesses.',
  ogDescription: 'A verified campus marketplace and booking record for student service businesses in Lagos.',
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
      description: 'Campus service marketplace and booking record for verified student businesses in Lagos.',
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
    <PricingSection :plans="plans || []" />
    <FaqSection />
    <FinalCta />
  </div>
</template>
