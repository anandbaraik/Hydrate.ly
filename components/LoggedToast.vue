<script setup lang="ts">
import AppIcon from './AppIcon.vue';

// Inline confirmation after a log, with a single Undo. It stays until the
// next log or until the popup closes; there are no timers in the popup.
// Screen readers hear the log through the live region in TodayView.
defineProps<{ amount: string }>();
const emit = defineEmits<{ undo: [] }>();
</script>

<template>
  <div
    class="flex h-11 items-center justify-between rounded-lg bg-water-tint pr-1.5 pl-3.5 text-label font-medium"
  >
    <span class="flex items-center gap-2">
      <AppIcon name="check" :size="18" :stroke-width="2" class="text-water-text" />
      Logged {{ amount }}
    </span>
    <button
      type="button"
      class="h-9 rounded-sm px-3 text-label font-bold text-water-text hover:bg-surface/60"
      @click="emit('undo')"
    >
      Undo
    </button>
  </div>
</template>
