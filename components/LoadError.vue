<script setup lang="ts">
// Shown instead of a blank screen when saved data cannot be read.
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div role="alert" class="flex flex-col items-center gap-1 px-4 py-12 text-center">
    <p class="m-0 text-title font-bold">Couldn't load your data</p>
    <p class="m-0 text-label text-ink-muted">Close and reopen Hydrate.ly, or try again.</p>
    <button
      type="button"
      class="mt-4 h-12 rounded-lg bg-primary px-5 text-body font-bold text-on-primary"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
