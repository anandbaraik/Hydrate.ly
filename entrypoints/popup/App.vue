<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import LoadError from '@/components/LoadError.vue';
import NoticeBanner from '@/components/NoticeBanner.vue';
import TabBar, { type TabId } from '@/components/TabBar.vue';
import { useIntakeStore } from '@/stores/intake';
import { useRemindersStore } from '@/stores/reminders';
import { useSettingsStore } from '@/stores/settings';
import HistoryView from './views/HistoryView.vue';
import SettingsView from './views/SettingsView.vue';
import TodayView from './views/TodayView.vue';

// The fixed frame of every popup screen: header, scrolling content, tab bar.
const settings = useSettingsStore();
const intake = useIntakeStore();
const reminders = useRemindersStore();

const tab = ref<TabId>('today');
const headerLabel = computed(
  () => ({ today: 'Today', history: 'Last 7 days', settings: 'Settings' })[tab.value],
);
const ready = computed(() => settings.loaded && intake.loaded);

const loadFailed = ref(false);
const actionFailed = ref(false);
const showNotice = computed(
  () => actionFailed.value || settings.saveFailed || (ready.value && loadFailed.value),
);

async function load(): Promise<void> {
  loadFailed.value = false;
  try {
    await Promise.all([settings.load(), intake.load()]);
    await reminders.load();
  } catch (error) {
    console.error('Hydrate.ly: could not load.', error);
    loadFailed.value = true;
  }
}

function dismissNotice(): void {
  actionFailed.value = false;
  loadFailed.value = false;
  settings.saveFailed = false;
}

// A failed log, undo or pause surfaces here instead of vanishing.
onErrorCaptured((error) => {
  console.error('Hydrate.ly:', error);
  actionFailed.value = true;
  return false;
});

onMounted(load);
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-bg">
    <AppHeader :label="headerLabel" />
    <NoticeBanner
      v-if="showNotice"
      message="Something didn't go through. Try that again."
      class="mx-4 mb-2 shrink-0"
      @dismiss="dismissNotice"
    />
    <main class="grow overflow-y-auto px-4 pt-1 pb-4">
      <template v-if="ready">
        <TodayView v-if="tab === 'today'" />
        <HistoryView v-else-if="tab === 'history'" />
        <SettingsView v-else />
      </template>
      <LoadError v-else-if="loadFailed" @retry="load" />
    </main>
    <TabBar v-model="tab" />
  </div>
</template>
