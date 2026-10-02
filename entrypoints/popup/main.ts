// The toolbar popup. It is created fresh on every click and destroyed when it
// closes, so nothing here outlives the popup: all state comes from storage.

// Figtree ships inside the extension; nothing is fetched at runtime (ADR-012).
import '@fontsource-variable/figtree';
import '@/assets/styles/main.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).use(createPinia()).mount('#app');
