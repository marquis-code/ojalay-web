<script setup lang="ts">
useHead({
  titleTemplate: (title) => {
    const value = title?.trim();
    if (!value) return 'Ojaly — sell products, offer services, get paid.';
    return /(^|[\s—·|-])ojaly($|[\s—·|-])/i.test(value) ? value : `${value} · Ojaly`;
  },
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#FF5A1F" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <PwaInstallPrompt />
  </div>
</template>
