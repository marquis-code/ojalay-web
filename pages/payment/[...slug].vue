<script setup lang="ts">
definePageMeta({ layout: false });
const route = useRoute();
const rawPath = route.fullPath;

let destination = '/';
// Matches /payment/https://ojaly.org/order/... or /payment/http://... or /payment/order/...
const match = rawPath.match(/^\/payment\/(?:https?:\/\/[^/]+)?(.*)/i);
if (match && match[1]) {
  destination = match[1].startsWith('/') ? match[1] : `/${match[1]}`;
}

await navigateTo(destination, { replace: true, redirectCode: 302 });
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas">
    <div class="text-center">
      <p class="font-display text-lg font-bold">Redirecting to your order…</p>
      <p class="mt-1 text-xs text-muted">Hold on, opening your tracking page.</p>
    </div>
  </div>
</template>
