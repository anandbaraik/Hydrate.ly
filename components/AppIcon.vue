<script setup lang="ts">
// Inline icons from the design system: 24x24, stroked with currentColor,
// round caps and joins. The drop is the only filled glyph.
export type IconName =
  | 'drop'
  | 'glass'
  | 'bottle'
  | 'plus'
  | 'eye'
  | 'pause'
  | 'play'
  | 'check'
  | 'close'
  | 'bell'
  | 'moon'
  | 'clock'
  | 'clock-hour'
  | 'target'
  | 'lock'
  | 'tab-today'
  | 'tab-history'
  | 'tab-settings';

withDefaults(defineProps<{ name: IconName; size?: number; strokeWidth?: number }>(), {
  size: 20,
  strokeWidth: 1.8,
});
</script>

<template>
  <svg
    v-if="name === 'drop'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    class="shrink-0"
  >
    <path d="M12 2.5c-3.2 4.2-6.5 7.8-6.5 11.6a6.5 6.5 0 0 0 13 0c0-3.8-3.3-7.4-6.5-11.6z" />
  </svg>
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0"
  >
    <template v-if="name === 'glass'">
      <path d="M6 4h12l-1.5 15a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8z" />
      <path d="M6.8 10h10.4" />
    </template>
    <template v-else-if="name === 'bottle'">
      <path d="M10 2.5h4" />
      <path d="M10.5 2.5v3L8.5 8.5V19a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V8.5l-2-3v-3" />
      <path d="M8.5 12h7" />
    </template>
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <template v-else-if="name === 'eye'">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </template>
    <path v-else-if="name === 'pause'" d="M9 5v14M15 5v14" />
    <path v-else-if="name === 'play'" d="M8 5.5v13l10-6.5z" />
    <path v-else-if="name === 'check'" d="M5 12.5l4.5 4.5L19 7.5" />
    <path v-else-if="name === 'close'" d="M6 6l12 12M18 6L6 18" />
    <template v-else-if="name === 'bell'">
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </template>
    <path v-else-if="name === 'moon'" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </template>
    <template v-else-if="name === 'clock-hour'">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12h4" />
    </template>
    <template v-else-if="name === 'target'">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </template>
    <template v-else-if="name === 'tab-today'">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 8 8" stroke-width="3" />
    </template>
    <path v-else-if="name === 'tab-history'" d="M5 20v-8M12 20V5M19 20v-11" />
    <template v-else-if="name === 'tab-settings'">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </template>
  </svg>
</template>
