<script setup lang="ts">
useHead({ titleTemplate: (title) => title ? `${title} · Ojaly` : 'Ojaly — sell products, offer services, get paid.' });
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
