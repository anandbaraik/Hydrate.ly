<script setup lang="ts">
import { computed } from 'vue';
import type { Unit } from '@/types';
import type { DayTotal } from '@/utils/history';
import { formatAmount } from '@/utils/units';

// Seven bars, oldest on the left and today on the right, with a dashed goal
// line. Hand-written SVG; no chart library (ADR-007).
const props = defineProps<{ days: DayTotal[]; goalMl: number; unit: Unit }>();

// Drawing units. 294 is the width inside the card in the 360px popup, so
// the chart renders 1:1 there and scales evenly anywhere else.
const WIDTH = 294;
const HEIGHT = 140;
const GAP = 8;
/** A day with nothing logged still shows a stub, so all seven days read as bars. */
const MIN_BAR = 5;

// The top of the chart: 20% of headroom above the goal line, or the best
// day if that is higher. The final 1 avoids dividing by zero.
const scaleMax = computed(() =>
  Math.max(props.goalMl * 1.2, ...props.days.map((day) => day.ml), 1),
);
// SVG y grows downwards, so heights are measured up from the bottom edge.
const goalY = computed(() => HEIGHT - (props.goalMl / scaleMax.value) * HEIGHT);

// A bar with 8px top corners and 4px bottom corners, as a single path.
function barPath(x: number, width: number, height: number): string {
  const top = HEIGHT - height;
  // Shrink the corner radii on short bars so the arcs never overlap.
  const rt = Math.min(8, height / 2, width / 2);
  const rb = Math.min(4, height / 2, width / 2);
  // Clockwise from the left edge, just below the top-left corner.
  return [
    `M${x},${top + rt}`,
    `a${rt},${rt} 0 0 1 ${rt},${-rt}`,
    `h${width - 2 * rt}`,
    `a${rt},${rt} 0 0 1 ${rt},${rt}`,
    `v${height - rt - rb}`,
    `a${rb},${rb} 0 0 1 ${-rb},${rb}`,
    `h${-(width - 2 * rb)}`,
    `a${rb},${rb} 0 0 1 ${-rb},${-rb}`,
    'z',
  ].join(' ');
}

const bars = computed(() => {
  const count = props.days.length;
  const width = (WIDTH - GAP * (count - 1)) / count;
  return props.days.map((day, index) => {
    const height = Math.max(MIN_BAR, (day.ml / scaleMax.value) * HEIGHT);
    // Met and missed days differ in lightness, not only in hue.
    const tone = day.isToday ? 'fill-ink' : day.ml >= props.goalMl ? 'fill-water' : 'fill-water-soft';
    return { key: day.key, path: barPath(index * (width + GAP), width, height), tone };
  });
});

// The chart is one image to a screen reader; this is its text equivalent.
const summary = computed(
  () =>
    `Daily intake, last ${props.days.length} days, oldest first: ` +
    props.days.map((day) => formatAmount(day.ml, props.unit)).join(', ') +
    `. Goal ${formatAmount(props.goalMl, props.unit)}.`,
);
</script>

<template>
  <div>
    <svg
      role="img"
      :aria-label="summary"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="block h-auto w-full"
    >
      <!-- Drawn first, so the bars sit in front of the goal line. -->
      <line
        x1="0"
        :x2="WIDTH"
        :y1="goalY"
        :y2="goalY"
        stroke-width="2"
        stroke-dasharray="6 5"
        class="stroke-line-strong"
      />
      <path v-for="bar in bars" :key="bar.key" :d="bar.path" :class="bar.tone" />
    </svg>
    <!-- Day initials, in a grid that lines up with the bars. The summary
         above already covers them for screen readers. -->
    <div class="mt-2 grid grid-cols-7 gap-2" aria-hidden="true">
      <span
        v-for="day in days"
        :key="day.key"
        :aria-current="day.isToday ? 'date' : undefined"
        class="text-center text-caption"
        :class="day.isToday ? 'font-extrabold text-ink' : 'font-semibold text-ink-muted'"
      >
        {{ day.label }}
      </span>
    </div>
  </div>
</template>
