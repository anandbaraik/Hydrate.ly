<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import type { BreakMode, NotificationStyle, Settings, Unit } from '@/types';
import { GOAL_ML, MESSAGE_MAX_LENGTH, POMODORO, WATER_INTERVAL } from '@/utils/constants';
import { formatDuration } from '@/utils/dates';
import { mlToUnit, unitToMl } from '@/utils/units';
import { clampGoalMl, clampInterval, isValidTimeOfDay } from '@/utils/validation';
import AppIcon from './AppIcon.vue';
import SegmentedControl from './SegmentedControl.vue';
import SwitchRow from './SwitchRow.vue';

// Every setting, grouped into cards. Shared by the popup's Settings tab and
// the full options page. Changes save as they are made.
const store = useSettingsStore();
const settings = computed(() => store.settings);

/**
 * A two-way binding for one setting, for use with `v-model`: reading comes
 * from the store, writing saves straight away. Used for switches and
 * segmented controls, where every change is a deliberate tap.
 */
function bind<K extends keyof Settings>(key: K) {
  return computed<Settings[K]>({
    get: () => store.settings[key],
    set: (value) => {
      void store.update({ [key]: value } as Pick<Settings, K>);
    },
  });
}

const breaksEnabled = bind('breaksEnabled');
const breakMode = bind('breakMode');
const notificationStyle = bind('notificationStyle');
const chime = bind('chime');
const unit = bind('unit');
const quietHoursEnabled = bind('quietHoursEnabled');
const autoPauseWhenAway = bind('autoPauseWhenAway');

// Water interval. The slider previews while dragging and saves on release,
// which keeps writes well under storage.sync's rate limit.
const intervalDraft = ref(settings.value.waterIntervalMin);
// Follow changes made elsewhere: the options page, or another synced device.
watch(
  () => settings.value.waterIntervalMin,
  (value) => {
    intervalDraft.value = value;
  },
);
/** Any interval that is not one of the preset chips lights up "Custom". */
const isCustomInterval = computed(
  () => !(WATER_INTERVAL.presets as readonly number[]).includes(intervalDraft.value),
);

/** How far along the slider is, 0 to 1. Drives the filled part of its track. */
const intervalProgress = computed(
  () => (intervalDraft.value - WATER_INTERVAL.min) / (WATER_INTERVAL.max - WATER_INTERVAL.min),
);

function saveInterval(minutes: number): void {
  intervalDraft.value = clampInterval(minutes);
  void store.update({ waterIntervalMin: intervalDraft.value });
}

/** Tapping Custom from a preset jumps to 90 min; if already custom, it stays put. */
function pickCustomInterval(): void {
  if (!isCustomInterval.value) saveInterval(WATER_INTERVAL.customDefault);
}

const breakModes: { value: BreakMode; label: string }[] = [
  { value: 'eye', label: '20-20-20 eyes' },
  { value: 'pomodoro', label: 'Pomodoro' },
];
const breakHelp = computed(() =>
  settings.value.breakMode === 'eye'
    ? 'Every 20 min, look at something 20 ft away for 20 seconds.'
    : `${POMODORO.focusMin} min of focus, then a ${POMODORO.shortBreakMin} min break. Longer break every ${POMODORO.roundsPerLongBreak} rounds.`,
);

const styles: { value: NotificationStyle; label: string }[] = [
  { value: 'banner', label: 'Banner' },
  { value: 'persistent', label: 'Persistent' },
];
const styleHelp = computed(() =>
  settings.value.notificationStyle === 'banner'
    ? 'Slides in and fades on its own.'
    : 'Stays on screen until you log or snooze.',
);

const units: { value: Unit; label: string }[] = [
  { value: 'ml', label: 'ml' },
  { value: 'oz', label: 'oz' },
];

// Text and number fields save on change (blur or Enter), not on every key.
function saveMessage(event: Event): void {
  const input = event.target as HTMLInputElement;
  void store.update({ message: input.value }).then(() => {
    // Show the cleaned-up text that was stored (trimmed, or the default if blank).
    input.value = store.settings.message;
  });
}

// The goal is stored in ml but shown and typed in the user's unit.
const goalValue = computed(() => Math.round(mlToUnit(settings.value.goalMl, settings.value.unit)));
const goalMin = computed(() => Math.ceil(mlToUnit(GOAL_ML.min, settings.value.unit)));
const goalMax = computed(() => Math.floor(mlToUnit(GOAL_ML.max, settings.value.unit)));

function saveGoal(event: Event): void {
  const input = event.target as HTMLInputElement;
  const typed = Number.parseFloat(input.value);
  if (Number.isFinite(typed)) {
    void store.update({ goalMl: clampGoalMl(unitToMl(typed, settings.value.unit)) });
  }
  // Show what was actually saved, including after clamping or bad input.
  input.value = String(goalValue.value);
}

function saveQuietTime(key: 'quietFrom' | 'quietTo', event: Event): void {
  const input = event.target as HTMLInputElement;
  if (isValidTimeOfDay(input.value)) void store.update({ [key]: input.value });
  // A cleared time field is not a valid time: put the saved one back.
  else input.value = settings.value[key];
}

// Class lists shared by the cards and fields below.
const card ='flex flex-col rounded-2xl border border-line bg-surface p-4';
const cardTitle = 'm-0 flex items-center gap-2 text-title font-bold';
const fieldLabel = 'text-label font-semibold text-ink-muted';
const textInput =
  'h-11 rounded-lg border border-line-strong bg-surface px-3.5 text-body focus:border-water disabled:cursor-not-allowed';
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Water reminders: preset chips, plus a slider for anything in between. -->
    <section :class="[card, 'gap-3']" aria-labelledby="settings-water">
      <h2 id="settings-water" :class="cardTitle">
        <AppIcon name="drop" :size="18" class="text-water" />
        Water reminders
      </h2>
      <div class="flex items-baseline justify-between">
        <span id="settings-interval" :class="fieldLabel">Remind me every</span>
        <span class="text-title font-bold tabular-nums">{{ formatDuration(intervalDraft) }}</span>
      </div>
      <div role="group" aria-labelledby="settings-interval" class="grid grid-cols-4 gap-1.5">
        <button
          v-for="preset in WATER_INTERVAL.presets"
          :key="preset"
          type="button"
          :aria-pressed="intervalDraft === preset"
          class="h-11 rounded-lg border text-label font-bold"
          :class="
            intervalDraft === preset
              ? 'border-primary bg-primary text-on-primary'
              : 'border-line-strong bg-surface text-ink'
          "
          @click="saveInterval(preset)"
        >
          {{ preset }} min
        </button>
        <button
          type="button"
          :aria-pressed="isCustomInterval"
          class="h-11 rounded-lg border text-label font-bold"
          :class="
            isCustomInterval
              ? 'border-primary bg-primary text-on-primary'
              : 'border-line-strong bg-surface text-ink'
          "
          @click="pickCustomInterval"
        >
          Custom
        </button>
      </div>
      <div class="flex flex-col gap-1.5 pt-1">
        <!-- The ends of the scale; the slider announces its own name and value. -->
        <span class="flex justify-between text-caption text-ink-muted" aria-hidden="true">
          <span>Custom · {{ formatDuration(WATER_INTERVAL.min) }}</span>
          <span>{{ formatDuration(WATER_INTERVAL.max) }}</span>
        </span>
        <input
          v-model.number="intervalDraft"
          type="range"
          :min="WATER_INTERVAL.min"
          :max="WATER_INTERVAL.max"
          :step="WATER_INTERVAL.step"
          aria-label="Custom reminder interval"
          :aria-valuetext="formatDuration(intervalDraft)"
          :style="{ '--range-progress': intervalProgress }"
          class="hl-range"
          @change="saveInterval(intervalDraft)"
        />
      </div>
    </section>

    <!-- Break reminders: on or off, then the style. -->
    <section :class="[card, 'gap-2']" aria-labelledby="settings-breaks">
      <h2 id="settings-breaks" :class="cardTitle">
        <AppIcon name="eye" :size="18" :stroke-width="1.9" />
        Break reminders
      </h2>
      <SwitchRow
        v-model="breaksEnabled"
        label="Remind me to take breaks"
        sub="Rest your eyes and stretch"
      />
      <!-- Dimmed and disabled, not hidden, so the choice is still visible while breaks are off. -->
      <div class="flex flex-col gap-2.5" :class="{ 'opacity-45': !breaksEnabled }">
        <SegmentedControl
          v-model="breakMode"
          :options="breakModes"
          label="Break style"
          :disabled="!breaksEnabled"
        />
        <p class="m-0 text-caption text-ink-muted">{{ breakHelp }}</p>
      </div>
    </section>

    <!-- Notifications: the custom message, banner or persistent, and the chime. -->
    <section :class="[card, 'gap-3']" aria-labelledby="settings-notifications">
      <h2 id="settings-notifications" :class="cardTitle">
        <AppIcon name="bell" :size="18" :stroke-width="1.9" />
        Notifications
      </h2>
      <label class="flex flex-col gap-1.5">
        <span :class="fieldLabel">Message</span>
        <input
          type="text"
          :value="settings.message"
          :maxlength="MESSAGE_MAX_LENGTH"
          :class="textInput"
          @change="saveMessage"
        />
      </label>
      <div class="flex flex-col gap-1.5">
        <span id="settings-style" :class="fieldLabel">Style</span>
        <SegmentedControl
          v-model="notificationStyle"
          :options="styles"
          labelledby="settings-style"
        />
        <p class="m-0 text-caption text-ink-muted">{{ styleHelp }}</p>
      </div>
      <div class="border-t border-line-soft">
        <SwitchRow
          v-model="chime"
          label="Gentle chime"
          sub="A soft two-note sound with each reminder"
        />
      </div>
      <!-- Required by docs/DESIGN.md. The chime caveat is explained in ADR-022. -->
      <p class="m-0 rounded-lg bg-surface-muted px-3 py-2.5 text-caption text-ink-muted">
        Not seeing reminders? On Windows, Focus Assist or Do Not Disturb hides them, though the
        chime can still play. Check that notifications are allowed for your browser.
      </p>
    </section>

    <!-- Daily goal and display unit. Switching unit converts the number shown. -->
    <section :class="[card, 'gap-3']" aria-labelledby="settings-goal">
      <h2 id="settings-goal" :class="cardTitle">
        <AppIcon name="target" :size="18" :stroke-width="1.9" />
        Daily goal
      </h2>
      <div class="flex gap-2">
        <label
          class="hl-field flex h-12 min-w-0 grow items-center gap-2 rounded-lg border border-line-strong px-3.5 focus-within:border-water"
        >
          <span class="sr-only">Daily goal in {{ settings.unit }}</span>
          <input
            type="number"
            inputmode="numeric"
            :min="goalMin"
            :max="goalMax"
            :value="goalValue"
            class="hl-number min-w-0 grow border-0 bg-transparent text-title font-semibold tabular-nums outline-none"
            @change="saveGoal"
          />
          <span class="text-label text-ink-muted">{{ settings.unit }}</span>
        </label>
        <SegmentedControl v-model="unit" :options="units" label="Unit" class="w-29 shrink-0" />
      </div>
    </section>

    <!-- Focus: quiet hours and auto-pause while away. -->
    <section :class="[card, 'gap-2']" aria-labelledby="settings-focus">
      <h2 id="settings-focus" :class="cardTitle">
        <AppIcon name="moon" :size="18" :stroke-width="1.9" />
        Focus
      </h2>
      <SwitchRow
        v-model="quietHoursEnabled"
        label="Quiet hours"
        sub="No reminders during this window"
      />
      <div
        role="group"
        aria-label="Quiet hours window"
        class="grid grid-cols-2 gap-2"
        :class="{ 'opacity-45': !quietHoursEnabled }"
      >
        <label class="flex flex-col gap-1.5">
          <span class="text-caption font-semibold text-ink-muted">From</span>
          <input
            type="time"
            :value="settings.quietFrom"
            :disabled="!quietHoursEnabled"
            :class="[textInput, 'px-3 tabular-nums']"
            @change="saveQuietTime('quietFrom', $event)"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-caption font-semibold text-ink-muted">To</span>
          <input
            type="time"
            :value="settings.quietTo"
            :disabled="!quietHoursEnabled"
            :class="[textInput, 'px-3 tabular-nums']"
            @change="saveQuietTime('quietTo', $event)"
          />
        </label>
      </div>
      <div class="mt-2 border-t border-line-soft">
        <SwitchRow
          v-model="autoPauseWhenAway"
          label="Pause when I'm away"
          sub="Resumes when you're back at your computer"
        />
      </div>
    </section>

    <p
      class="m-0 mt-1 flex items-center justify-center gap-2 p-3 text-center text-caption text-ink-muted"
    >
      <AppIcon name="lock" :size="16" :stroke-width="2" />
      Everything stays on this device. No account, no servers.
    </p>
  </div>
</template>
