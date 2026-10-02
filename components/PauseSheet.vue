<script setup lang="ts">
import type { PauseOption, Settings } from '@/types';
import { formatClock } from '@/utils/dates';
import { pauseUntil } from '@/utils/pause';
import AppIcon, { type IconName } from './AppIcon.vue';
import BottomSheet from './BottomSheet.vue';

// One tap pauses both water and break reminders and closes the sheet.
const props = defineProps<{ settings: Settings }>();
const emit = defineEmits<{ pick: [option: PauseOption]; close: [] }>();

// Each option shows its outcome ("until 12:10 PM"). The time is read once,
// when the sheet opens, so the three labels agree with each other.
const now = new Date();
const until = (option: PauseOption) => formatClock(pauseUntil(option, now, props.settings));

const options: { id: PauseOption; icon: IconName; label: string; outcome: string }[] = [
  { id: '30min', icon: 'clock', label: '30 minutes', outcome: `until ${until('30min')}` },
  { id: '1hour', icon: 'clock-hour', label: '1 hour', outcome: `until ${until('1hour')}` },
  { id: 'tomorrow', icon: 'moon', label: 'Until tomorrow', outcome: until('tomorrow') },
];
</script>

<template>
  <BottomSheet
    title="Pause reminders"
    sub="Water and break reminders stay quiet until then."
    @close="emit('close')"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      class="flex min-h-14 w-full items-center gap-3 rounded-lg px-1 text-left hover:bg-surface-muted"
      @click="emit('pick', option.id)"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink"
      >
        <AppIcon :name="option.icon" :size="18" :stroke-width="1.9" />
      </span>
      <span class="grow text-title font-semibold">{{ option.label }}</span>
      <span class="text-label text-ink-muted tabular-nums">{{ option.outcome }}</span>
    </button>
  </BottomSheet>
</template>
