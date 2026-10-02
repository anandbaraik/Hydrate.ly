<script setup lang="ts">
import { ref } from 'vue';
import type { Unit } from '@/types';
import { AMOUNT_ML, CUSTOM_QUICK_ML } from '@/utils/constants';
import { formatAmount, unitToMl } from '@/utils/units';
import { isValidAmountMl } from '@/utils/validation';
import BottomSheet from './BottomSheet.vue';

// Four quick sizes, or type an amount in the user's unit.
const props = defineProps<{ unit: Unit }>();
const emit = defineEmits<{ log: [ml: number]; close: [] }>();

// Vue hands back a number from a number input, or '' while it is empty.
const amount = ref<number | string>('');
const error = ref('');

function submit(): void {
  // The field is in the user's unit; validation and storage are in ml.
  const ml = unitToMl(Number.parseFloat(String(amount.value)), props.unit);
  if (!isValidAmountMl(ml)) {
    error.value = `Enter an amount up to ${formatAmount(AMOUNT_ML.max, props.unit)}.`;
    return;
  }
  emit('log', ml);
}
</script>

<template>
  <BottomSheet title="Log a custom amount" sub="Tap a size or type your own." @close="emit('close')">
    <div role="group" aria-label="Quick amounts" class="mt-1 mb-3 grid grid-cols-4 gap-2">
      <button
        v-for="ml in CUSTOM_QUICK_ML"
        :key="ml"
        type="button"
        class="h-12 rounded-lg border border-line bg-surface-muted text-body font-bold tabular-nums hover:border-line-strong"
        @click="emit('log', ml)"
      >
        {{ formatAmount(ml, unit) }}
      </button>
    </div>

    <!-- `novalidate`: submit() shows our own message instead of the browser's bubble. -->
    <form class="m-0 flex gap-2" novalidate @submit.prevent="submit">
      <label
        class="hl-field flex h-12 grow items-center gap-2 rounded-lg border bg-surface px-3.5 focus-within:border-water"
        :class="error ? 'border-ink' : 'border-line-strong'"
      >
        <span class="sr-only">Amount in {{ unit }}</span>
        <input
          v-model="amount"
          type="number"
          inputmode="decimal"
          min="1"
          step="any"
          placeholder="Amount"
          data-autofocus
          :aria-invalid="error ? 'true' : undefined"
          aria-describedby="custom-amount-error"
          class="hl-number min-w-0 grow border-0 bg-transparent text-title tabular-nums outline-none placeholder:text-ink-muted"
          @input="error = ''"
        />
        <span class="text-label text-ink-muted">{{ unit }}</span>
      </label>
      <button
        type="submit"
        class="h-12 rounded-lg bg-primary px-5.5 text-body font-bold text-on-primary"
      >
        Log
      </button>
    </form>
    <!-- Always in the page, even when empty, so the error is announced when it appears. -->
    <p
      id="custom-amount-error"
      role="alert"
      class="mx-1 my-0 text-caption text-ink-body"
      :class="{ 'mt-1': error }"
    >
      {{ error }}
    </p>
  </BottomSheet>
</template>
