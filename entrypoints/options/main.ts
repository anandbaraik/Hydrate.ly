// The full-page settings, opened from the browser's extension menu (Options).

// Figtree ships inside the extension; nothing is fetched at runtime (ADR-012).
import '@fontsource-variable/figtree';
import '@/assets/styles/main.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).use(createPinia()).mount('#app');
