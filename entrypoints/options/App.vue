<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import LoadError from '@/components/LoadError.vue';
import NoticeBanner from '@/components/NoticeBanner.vue';
import SettingsForm from '@/components/SettingsForm.vue';
import { useSettingsStore } from '@/stores/settings';

// The full-page settings: the same form as the popup's Settings tab.
const settings = useSettingsStore();
const loadFailed = ref(false);

async function load(): Promise<void> {
  loadFailed.value = false;
  try {
    await settings.load();
  } catch (error) {
    console.error('Hydrate.ly: could not load.', error);
    loadFailed.value = true;
  }
}

onMounted(load);
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-120 flex-col">
    <AppHeader label="Settings" />
    <NoticeBanner
      v-if="settings.saveFailed"
      message="That change wasn't saved. Try again."
      class="mx-4 mb-2"
      @dismiss="settings.saveFailed = false"
    />
    <main class="px-4 pt-1 pb-8">
      <SettingsForm v-if="settings.loaded" />
      <LoadError v-else-if="loadFailed" @retry="load" />
    </main>
  </div>
</template>
