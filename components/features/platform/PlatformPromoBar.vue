<script setup lang="ts">
const { campaign, load } = usePlatformCampaign();
onMounted(load);
const text = computed(() => campaign.value.bannerText || (campaign.value.percentOff ? `${campaign.value.percentOff}% off every order and booking on Ojaly.` : ''));
</script>

<template>
  <div v-if="campaign.enabled && text" class="overflow-hidden bg-forest-900 text-white">
    <div class="flex w-max animate-promo-marquee items-center gap-8 py-2 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]">
      <template v-for="i in 3" :key="i"><span class="inline-flex items-center gap-2"><span class="rounded-full bg-brand-500 px-2 py-0.5 text-[9px] text-white">{{ campaign.badgeText || `${campaign.percentOff}% OFF` }}</span>{{ text }}</span><span class="text-white/30">✦</span></template>
    </div>
  </div>
</template>

<style scoped>
@keyframes promo-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
.animate-promo-marquee { animation: promo-marquee 22s linear infinite; }
@media (prefers-reduced-motion: reduce) { .animate-promo-marquee { animation: none; } }
</style>
