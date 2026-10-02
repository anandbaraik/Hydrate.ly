---
paths:
  - "components/**"
  - "entrypoints/popup/**"
  - "entrypoints/options/**"
  - "assets/**"
---

# UI rules

For the popup and the options page.

- Follow `docs/DESIGN.md`.
- Use the theme tokens from `assets/styles/main.css` (`bg-surface`, `text-ink-muted`, `border-line`, `rounded-2xl`). No raw hex colours in components.
- Blue (`water`) means water. Primary buttons are ink. Accent text uses `water-text`.
- Draw charts with hand-written SVG; no chart libraries.
- The popup is 360 px wide and at most 600 px tall. No horizontal scroll.
- Overlays are bottom sheets (`BottomSheet.vue`), never centred modals.
- Include empty states and error states.
- Show amounts in the unit the user picked (`utils/units.ts`). Store them in ml.
- Real `<button>`, `<input>` and `<label>` elements. Icon-only buttons need `aria-label`. Targets are at least 44 px tall. Focus stays visible.
- Copy is short, plain and sentence case. No emoji, no exclamation marks.
- Never use `v-html`.
