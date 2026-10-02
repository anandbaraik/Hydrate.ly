<script setup lang="ts">
import { computed } from 'vue';
import HistoryBars from '@/components/HistoryBars.vue';
import LogList from '@/components/LogList.vue';
import { useIntakeStore } from '@/stores/intake';
import { useSettingsStore } from '@/stores/settings';
import { formatAmount, formatNumber } from '@/utils/units';

// The 7-day chart, average and streak, and today's log.
const settings = useSettingsStore();
const intake = useIntakeStore();

const unit = computed(() => settings.settings.unit);
const goalMl = computed(() => settings.settings.goalMl);
/** False when all seven days are empty; the chart then gets a caption. */
const hasHistory = computed(() => intake.week.some((day) => day.ml > 0));

// Class lists shared by the two stat tiles.
const tile ='flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3.5';
const tileLabel = 'text-caption font-semibold text-ink-muted';
const tileValue = 'text-stat font-bold tracking-[-0.02em] tabular-nums';
const tileUnit = 'text-label font-semibold tracking-normal text-ink-muted';
</script>

<template>
  <div class="flex flex-col gap-3">
    <section aria-labelledby="history-week" class="rounded-2xl border border-line bg-surface p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 id="history-week" class="m-0 text-title font-bold">This week</h2>
        <span class="flex items-center gap-1.5 text-caption text-ink-muted">
          <span class="w-3.5 border-t-2 border-dashed border-line-strong"></span>
          Goal {{ formatAmount(goalMl, unit) }}
        </span>
      </div>
      <HistoryBars :days="intake.week" :goal-ml="goalMl" :unit="unit" />
      <p v-if="!hasHistory" class="mt-3 mb-0 text-center text-caption text-ink-muted">
        Nothing logged in the last 7 days yet.
      </p>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <div :class="tile">
        <span :class="tileLabel">Daily average</span>
        <span :class="tileValue">
          {{ formatNumber(intake.averageMl, unit) }}
          <span :class="tileUnit">{{ unit }}</span>
        </span>
      </div>
      <div :class="tile">
        <span :class="tileLabel">Streak</span>
        <span :class="tileValue">
          {{ intake.streakDays }}
          <span :class="tileUnit">{{ intake.streakDays === 1 ? 'day' : 'days' }}</span>
        </span>
      </div>
    </div>

    <section
      aria-labelledby="history-today"
      class="rounded-2xl border border-line bg-surface pt-1 pr-2 pb-1.5 pl-4"
    >
      <div class="flex h-12 items-center justify-between pr-2">
        <h2 id="history-today" class="m-0 text-title font-bold">Today</h2>
        <span class="text-label text-ink-muted tabular-nums">
          {{ formatNumber(intake.todayMl, unit) }} / {{ formatAmount(goalMl, unit) }}
        </span>
      </div>
      <!--
        The card has less padding on the right so the remove buttons sit
        close to its edge. The empty state has no buttons, so it gets the
        difference back as a margin and stays centred.
      -->
      <LogList
        :entries="intake.todayEntries"
        :unit="unit"
        :class="{ 'mr-2': intake.todayEntries.length === 0 }"
        @remove="intake.remove($event)"
      />
    </section>
  </div>
</template>
