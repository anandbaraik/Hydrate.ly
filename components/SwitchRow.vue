<script setup lang="ts">
// A settings row whose whole width toggles a switch.
defineProps<{ label: string; sub: string }>();
const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label class="flex min-h-14 items-center gap-3">
    <span class="flex grow flex-col gap-0.5">
      <span class="text-body font-semibold">{{ label }}</span>
      <span class="text-caption text-ink-muted">{{ sub }}</span>
    </span>
    <input v-model="model" type="checkbox" role="switch" class="hl-switch" />
  </label>
</template>
