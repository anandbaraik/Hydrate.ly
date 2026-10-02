<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue';

// The fixed 60px bottom bar. The popup has no router: the tabs just switch
// which view App.vue renders.
export type TabId = 'today' | 'history' | 'settings';

const model = defineModel<TabId>({ required: true });

const tabs: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'tab-today' },
  { id: 'history', label: 'History', icon: 'tab-history' },
  { id: 'settings', label: 'Settings', icon: 'tab-settings' },
];
</script>

<template>
  <nav aria-label="Main" class="grid h-15 shrink-0 grid-cols-3 border-t border-line bg-surface">
    <!--
      The focus ring is drawn inside each tab (negative outline offset): the
      bar sits on the popup's edge, where an outside ring would be clipped.
    -->
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :aria-current="model === tab.id ? 'page' : undefined"
      class="flex flex-col items-center justify-center gap-[3px] text-tab -outline-offset-2"
      :class="
        model === tab.id
          ? 'font-bold text-water-text'
          : 'font-semibold text-ink-muted hover:text-ink'
      "
      @click="model = tab.id"
    >
      <AppIcon :name="tab.icon" :size="20" :stroke-width="1.9" />
      {{ tab.label }}
    </button>
  </nav>
</template>
