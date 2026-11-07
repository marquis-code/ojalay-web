<script setup lang="ts">
const { campaign, load } = usePlatformCampaign();
onMounted(load);
</script>

<template>
  <span v-if="campaign.enabled" class="inline-flex items-center rounded-full bg-brand-500 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white">{{ campaign.badgeText || `${campaign.percentOff}% OFF` }}</span>
</template>
