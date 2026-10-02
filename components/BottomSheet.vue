<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';

// The only overlay in the popup: a panel rising from the bottom over a
// scrim. Esc, the scrim and Cancel all close it.
defineProps<{ title: string; sub?: string }>();
const emit = defineEmits<{ close: [] }>();

const titleId = useId();
const panel = ref<HTMLElement | null>(null);
/** Whatever opened the sheet, so focus can go back there when it closes. */
let previousFocus: HTMLElement | null = null;

/** The kinds of control a sheet contains. Queried inside the panel only. */
const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), a[href]';

function focusable(): HTMLElement[] {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
}

// Keep Tab inside the dialog while it is open.
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusable();
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  // A sheet can mark the control to start on with `data-autofocus`;
  // otherwise focus goes to its first control.
  const preferred = panel.value?.querySelector<HTMLElement>('[data-autofocus]');
  (preferred ?? focusable()[0])?.focus();
});

onBeforeUnmount(() => previousFocus?.focus());
</script>

<template>
  <!-- `fixed` covers the whole popup, header and tab bar included. -->
  <div class="fixed inset-0 z-10" @keydown="onKeydown">
    <!--
      The scrim closes the sheet on click. It is kept out of the Tab order:
      keyboard users have Esc and Cancel, and it would be a confusing stop.
    -->
    <button
      type="button"
      aria-label="Close"
      tabindex="-1"
      class="absolute inset-0 cursor-default! border-0 bg-scrim p-0"
      @click="emit('close')"
    ></button>
    <section
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      class="absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-t-sheet bg-surface px-4 pt-2 pb-4 shadow-sheet"
    >
      <!-- The grip is decoration only; the sheet cannot be dragged. -->
      <div class="mb-3 h-1 w-9 self-center rounded-full bg-line-strong"></div>
      <h2 :id="titleId" class="mx-1 my-0 text-heading font-bold tracking-[-0.01em]">
        {{ title }}
      </h2>
      <p v-if="sub" class="mx-1 mt-0 mb-2 text-label text-ink-muted">{{ sub }}</p>
      <slot />
      <button
        type="button"
        class="mt-2 h-12 rounded-lg border border-line-strong bg-surface text-body font-bold"
        @click="emit('close')"
      >
        Cancel
      </button>
    </section>
  </div>
</template>
