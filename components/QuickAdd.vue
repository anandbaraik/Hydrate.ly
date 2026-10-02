<script setup lang="ts">
import type { Unit } from '@/types';
import { QUICK_ADD_ML } from '@/utils/constants';
import { formatAmount } from '@/utils/units';
import AppIcon from './AppIcon.vue';

// Three equal buttons under the ring: a glass, a bottle and Custom.
defineProps<{ unit: Unit; customOpen: boolean }>();
const emit = defineEmits<{ log: [ml: number]; custom: [] }>();

const base =
  'flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-body font-semibold';
const idle = 'border-line bg-surface hover:border-line-strong';
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <button type="button" :class="[base, idle]" @click="emit('log', QUICK_ADD_ML.small)">
      <AppIcon name="glass" class="text-water" />
      <span>+{{ formatAmount(QUICK_ADD_ML.small, unit) }}</span>
    </button>
    <button type="button" :class="[base, idle]" @click="emit('log', QUICK_ADD_ML.large)">
      <AppIcon name="bottle" class="text-water" />
      <span>+{{ formatAmount(QUICK_ADD_ML.large, unit) }}</span>
    </button>
    <button
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="customOpen"
      :class="[base, customOpen ? 'border-water-soft bg-water-tint' : idle]"
      @click="emit('custom')"
    >
      <AppIcon name="plus" class="text-water" />
      <span>Custom</span>
    </button>
  </div>
</template>
