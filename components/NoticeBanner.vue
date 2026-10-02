<script setup lang="ts">
import AppIcon from './AppIcon.vue';

// A calm, dismissible notice for something that did not go through.
defineProps<{ message: string }>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <div
    role="alert"
    class="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line-strong bg-surface pl-3.5 text-label font-medium"
  >
    <span class="py-2">{{ message }}</span>
    <button
      type="button"
      aria-label="Dismiss"
      class="flex size-11 shrink-0 items-center justify-center rounded-md text-ink-muted hover:text-ink"
      @click="emit('dismiss')"
    >
      <AppIcon name="close" :size="16" :stroke-width="2" />
    </button>
  </div>
</template>
