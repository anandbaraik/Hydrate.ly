<script setup lang="ts">
import AppIcon from './AppIcon.vue';

// The fixed 56px top bar: wordmark on the left, a quiet context label on the right.
defineProps<{ label: string }>();
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between bg-bg px-5">
    <h1 class="m-0 flex items-center gap-2 text-heading leading-[1.2] font-extrabold tracking-[-0.02em]">
      <AppIcon name="drop" :size="22" class="text-water" />
      <span>Hydrate<span class="text-water-text">.ly</span></span>
    </h1>
    <span class="text-label font-medium text-ink-muted">{{ label }}</span>
  </header>
</template>
