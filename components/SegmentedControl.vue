<script setup lang="ts" generic="T extends string">
// A small set of mutually exclusive options on a sunken track.
// Generic over the option values, so `v-model` keeps its exact type
// ('ml' | 'oz') instead of widening to string.
defineProps<{
  options: { value: T; label: string }[];
  /** Accessible name for the group. Pass this or `labelledby`. */
  label?: string;
  /** Id of a visible element that names the group. */
  labelledby?: string;
  disabled?: boolean;
}>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    :aria-labelledby="labelledby"
    class="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-surface-sunken p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="model === option.value"
      :disabled="disabled"
      class="h-10 rounded-[9px] border-0 text-label font-bold disabled:cursor-not-allowed"
      :class="
        model === option.value
          ? 'bg-surface text-ink shadow-raised'
          : 'bg-transparent text-ink-muted hover:text-ink'
      "
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
