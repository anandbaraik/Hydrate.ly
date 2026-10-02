<script setup lang="ts">
import type { IntakeEntry, Unit } from '@/types';
import { formatClock } from '@/utils/dates';
import { formatAmount } from '@/utils/units';
import AppIcon from './AppIcon.vue';

// Today's drinks, newest first: time, amount, where it was logged, remove.
defineProps<{ entries: IntakeEntry[]; unit: Unit }>();
const emit = defineEmits<{ remove: [id: string] }>();
</script>

<template>
  <ul v-if="entries.length > 0" class="m-0 flex list-none flex-col p-0">
    <li
      v-for="entry in entries"
      :key="entry.id"
      class="flex h-13 items-center gap-3 border-t border-line-soft"
    >
      <span class="w-16 text-label text-ink-muted tabular-nums">{{ formatClock(entry.at) }}</span>
      <span class="grow text-title font-bold tabular-nums">
        {{ formatAmount(entry.ml, unit) }}
      </span>
      <span
        v-if="entry.source === 'reminder'"
        title="Logged from a reminder"
        class="flex items-center gap-1 text-caption text-ink-muted"
      >
        <AppIcon name="bell" :size="14" :stroke-width="2" />
        Reminder
      </span>
      <button
        type="button"
        :aria-label="`Remove ${formatAmount(entry.ml, unit)} at ${formatClock(entry.at)}`"
        class="flex size-11 shrink-0 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink"
        @click="emit('remove', entry.id)"
      >
        <AppIcon name="close" :size="16" :stroke-width="2" />
      </button>
    </li>
  </ul>
  <div v-else class="flex flex-col items-center gap-1 border-t border-line-soft py-6 text-center">
    <AppIcon name="glass" :size="24" class="text-water" />
    <p class="m-0 text-body font-semibold">No drinks logged today</p>
    <p class="m-0 text-caption text-ink-muted">Log your first glass from the Today tab.</p>
  </div>
</template>
