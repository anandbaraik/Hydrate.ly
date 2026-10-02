<script setup lang="ts">
import { computed } from 'vue';
import type { Settings } from '@/types';
import { EYE_BREAK_INTERVAL_MIN, POMODORO } from '@/utils/constants';
import { formatClock, formatDuration, minutesUntil } from '@/utils/dates';
import AppIcon from './AppIcon.vue';

// Upcoming reminders with their countdowns, plus the pause control.
const props = defineProps<{
  settings: Settings;
  nextWaterAt: number | null;
  nextBreakAt: number | null;
  now: number;
  pausedUntil: number | null;
  paused: boolean;
  inQuietHours: boolean;
}>();
const emit = defineEmits<{ pause: []; resume: [] }>();

/** "24 min" until an alarm at `at`; a dash when none is scheduled. */
const countdown = (at: number | null) => {
  if (props.paused) return 'Paused';
  if (at === null) return '–';
  // Never "0 min": an alarm that is due this very minute reads "1 min".
  return formatDuration(Math.max(1, minutesUntil(at, props.now)));
};

// The card's title doubles as the status line: it says why no reminder is
// coming when reminders are paused or in quiet hours.
const heading = computed(() => {
  if (props.paused && props.pausedUntil !== null) {
    return `Paused until ${formatClock(props.pausedUntil)}`;
  }
  if (props.inQuietHours) return 'Quiet hours · reminders are off';
  return 'Up next';
});

// The second row describes whichever break style is on.
const breakRow = computed(() =>
  props.settings.breakMode === 'eye'
    ? {
        icon: 'eye' as const,
        title: 'Eye break',
        sub: `20-20-20 rule · every ${EYE_BREAK_INTERVAL_MIN} min`,
      }
    : {
        icon: 'clock' as const,
        title: 'Focus break',
        sub: `Pomodoro · ${POMODORO.focusMin} min focus`,
      },
);
</script>

<template>
  <section
    aria-label="Upcoming reminders"
    class="rounded-2xl border border-line bg-surface px-4 pt-1 pb-2"
  >
    <div class="flex h-11 items-center justify-between">
      <h2 class="m-0 text-label font-semibold text-ink-muted">{{ heading }}</h2>
      <button
        type="button"
        class="-mr-2 flex h-9 items-center gap-1.5 rounded-md px-3 text-label font-bold text-water-text hover:bg-water-tint"
        @click="paused ? emit('resume') : emit('pause')"
      >
        <AppIcon :name="paused ? 'play' : 'pause'" :size="16" :stroke-width="2.2" />
        {{ paused ? 'Resume' : 'Pause' }}
      </button>
    </div>

    <div class="flex flex-col">
      <div class="flex min-h-13 items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-md bg-water-tint text-water-text"
        >
          <AppIcon name="drop" :size="18" />
        </span>
        <div class="flex min-w-0 grow flex-col gap-px">
          <span class="text-body font-semibold">Water</span>
          <span class="text-caption text-ink-muted">
            Every {{ formatDuration(settings.waterIntervalMin) }}
          </span>
        </div>
        <span class="text-title font-bold tabular-nums" :class="{ 'text-ink-muted': paused }">
          {{ countdown(nextWaterAt) }}
        </span>
      </div>

      <template v-if="settings.breaksEnabled">
        <div class="ml-12 h-px bg-line-soft"></div>
        <div class="flex min-h-13 items-center gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink"
          >
            <AppIcon :name="breakRow.icon" :size="18" />
          </span>
          <div class="flex min-w-0 grow flex-col gap-px">
            <span class="text-body font-semibold">{{ breakRow.title }}</span>
            <span class="text-caption text-ink-muted">{{ breakRow.sub }}</span>
          </div>
          <span class="text-title font-bold tabular-nums" :class="{ 'text-ink-muted': paused }">
            {{ countdown(nextBreakAt) }}
          </span>
        </div>
      </template>
    </div>
  </section>
</template>
