<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CustomAmountSheet from '@/components/CustomAmountSheet.vue';
import LoggedToast from '@/components/LoggedToast.vue';
import PauseSheet from '@/components/PauseSheet.vue';
import ProgressRing from '@/components/ProgressRing.vue';
import QuickAdd from '@/components/QuickAdd.vue';
import UpNextCard from '@/components/UpNextCard.vue';
import { useIntakeStore } from '@/stores/intake';
import { useRemindersStore } from '@/stores/reminders';
import { useSettingsStore } from '@/stores/settings';
import type { PauseOption } from '@/types';
import { formatAmount, formatNumber } from '@/utils/units';

// Progress ring, quick log, Undo toast and upcoming reminders.
const settings = useSettingsStore();
const intake = useIntakeStore();
const reminders = useRemindersStore();

const sheet = ref<'custom' | 'pause' | null>(null);

const announcement = computed(() => {
  if (!intake.lastLogged) return '';
  const { unit, goalMl } = settings.settings;
  return `Logged ${formatAmount(intake.lastLogged.ml, unit)}. ${formatNumber(intake.todayMl, unit)} of ${formatAmount(goalMl, unit)} today.`;
});

// Settings changed on another tab may have rescheduled the reminders.
onMounted(() => reminders.refresh());

async function log(ml: number): Promise<void> {
  sheet.value = null;
  await intake.log(ml);
  // Logging restarts the water countdown.
  await reminders.refresh();
}

async function pause(option: PauseOption): Promise<void> {
  sheet.value = null;
  await reminders.pause(option);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ProgressRing
      :current-ml="intake.todayMl"
      :goal-ml="settings.settings.goalMl"
      :unit="settings.settings.unit"
    />

    <QuickAdd
      :unit="settings.settings.unit"
      :custom-open="sheet === 'custom'"
      @log="log"
      @custom="sheet = 'custom'"
    />

    <!--
      Always in the page, so screen readers announce each log. The running
      total makes the text change even when the same amount is logged twice.
    -->
    <p class="sr-only" role="status">{{ announcement }}</p>

    <LoggedToast
      v-if="intake.lastLogged"
      :amount="formatAmount(intake.lastLogged.ml, settings.settings.unit)"
      @undo="intake.undo()"
    />

    <UpNextCard
      :settings="settings.settings"
      :next-water-at="reminders.nextWaterAt"
      :next-break-at="reminders.nextBreakAt"
      :now="reminders.now"
      :paused-until="reminders.pausedUntil"
      :paused="reminders.paused"
      :in-quiet-hours="reminders.inQuietHours"
      @pause="sheet = 'pause'"
      @resume="reminders.resume()"
    />

    <CustomAmountSheet
      v-if="sheet === 'custom'"
      :unit="settings.settings.unit"
      @log="log"
      @close="sheet = null"
    />
    <PauseSheet
      v-if="sheet === 'pause'"
      :settings="settings.settings"
      @pick="pause"
      @close="sheet = null"
    />
  </div>
</template>
