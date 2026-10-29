<script setup lang="ts">
definePageMeta({ layout: 'default' });
const route = useRoute();
await navigateTo({ path: '/marketplace', query: route.query }, { redirectCode: 301, replace: true });
</script>
<template><div /></template>
