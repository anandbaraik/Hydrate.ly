import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.output/**', '.wxt/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      // Formatting is not ESLint's job here; keep the Vue rules to correctness.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    // RULES.md: reminders are scheduled with chrome.alarms, never timers.
    files: ['entrypoints/background.ts', 'services/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'setInterval', message: 'Use chrome.alarms (services/alarms.ts).' },
        { name: 'setTimeout', message: 'Use chrome.alarms (services/alarms.ts).' },
      ],
    },
  },
  {
    // RULES.md: Vue components never call chrome.* directly; use services/.
    files: ['components/**/*.vue', 'entrypoints/**/*.vue', 'stores/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'wxt/browser', message: 'Go through services/ instead.' }] },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'chrome', message: 'Go through services/ instead.' },
        { name: 'browser', message: 'Go through services/ instead.' },
      ],
    },
  },
);
