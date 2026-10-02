<script setup lang="ts">
import { computed } from 'vue';
import type { Unit } from '@/types';
import { progressFraction, progressStatus } from '@/utils/progress';
import { formatAmount, formatNumber } from '@/utils/units';

// Today's intake against the daily goal. Hand-written SVG: 176px box,
// radius 78, stroke 10, starting at 12 o'clock.
const props = defineProps<{ currentMl: number; goalMl: number; unit: Unit }>();

const SIZE = 176;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// The value arc is one dash as long as the whole circle. Shifting it by
// `dashOffset` hides the part not yet reached: a full offset shows nothing,
// zero shows the complete ring.
// The ring stays full past the goal; the number keeps counting.
const dashOffset = computed(() =>
  (CIRCUMFERENCE * (1 - progressFraction(props.currentMl, props.goalMl))).toFixed(2),
);
const status = computed(() => progressStatus(props.currentMl, props.goalMl, props.unit));
</script>

<template>
  <section aria-label="Today's progress" class="flex flex-col items-center gap-2.5 pt-1">
    <div class="relative size-44">
      <!-- An SVG circle starts at 3 o'clock; the rotation moves the start to 12. -->
      <svg
        :width="SIZE"
        :height="SIZE"
        :viewBox="`0 0 ${SIZE} ${SIZE}`"
        class="block -rotate-90"
        aria-hidden="true"
      >
        <circle
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="RADIUS"
          fill="none"
          stroke-width="10"
          class="stroke-track"
        />
        <circle
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="RADIUS"
          fill="none"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE.toFixed(2)"
          :stroke-dashoffset="dashOffset"
          class="hl-ring-value stroke-water"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span class="text-ring font-bold tracking-[-0.03em] tabular-nums">
          {{ formatNumber(currentMl, unit) }}
        </span>
        <span class="text-label text-ink-muted">of {{ formatAmount(goalMl, unit) }}</span>
      </div>
    </div>
    <p class="m-0 text-label font-semibold text-water-text">{{ status }}</p>
  </section>
</template>
