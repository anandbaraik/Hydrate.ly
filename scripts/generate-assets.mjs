// Generates the binary assets in public/ from source: extension icons,
// notification icons and the reminder chime. Run with `npm run assets`.
// The outputs are committed, so this only needs re-running when they change.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

// Colours and paths come from the design system (docs/DESIGN.md).
const WATER = '#1A9BE0';
const WATER_TINT = '#E8F4FB';
const INK = '#0E1A24';
const SURFACE_MUTED = '#F3F7FA';
const DROP = 'M12 2.5c-3.2 4.2-6.5 7.8-6.5 11.6a6.5 6.5 0 0 0 13 0c0-3.8-3.3-7.4-6.5-11.6z';
const EYE = 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z';

const tile = (fill, glyph) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="5.5" fill="${fill}"/>
  <g transform="translate(12 12) scale(0.7) translate(-12 -11.6)">${glyph}</g>
</svg>`;

const waterIcon = tile(WATER_TINT, `<path d="${DROP}" fill="${WATER}"/>`);
const breakIcon = tile(
  SURFACE_MUTED,
  `<g fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -0.4)">
    <path d="${EYE}"/><circle cx="12" cy="12" r="3"/>
  </g>`,
);

async function png(svg, size, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg), { density: 72 * (size / 24) })
    .resize(size, size)
    .png()
    .toFile(file);
}

// A soft two-note chime: two decaying sine tones a fourth apart.
function chimeWav() {
  const sampleRate = 22050;
  const seconds = 1.1;
  const notes = [
    { hz: 659.25, start: 0 }, // E5
    { hz: 880.0, start: 0.2 }, // A5
  ];
  const count = Math.floor(sampleRate * seconds);
  const pcm = Buffer.alloc(count * 2);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const { hz, start } of notes) {
      const local = t - start;
      if (local < 0) continue;
      const attack = Math.min(1, local / 0.012);
      const decay = Math.exp(-local * 5.5);
      const tone = Math.sin(2 * Math.PI * hz * local) + 0.18 * Math.sin(4 * Math.PI * hz * local);
      sample += tone * attack * decay;
    }
    const fadeOut = Math.min(1, (seconds - t) / 0.08);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample * 0.22 * fadeOut)) * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

for (const size of [16, 32, 48, 96, 128]) {
  await png(waterIcon, size, path.join(publicDir, 'icon', `${size}.png`));
}
await png(waterIcon, 192, path.join(publicDir, 'notifications', 'water.png'));
await png(breakIcon, 192, path.join(publicDir, 'notifications', 'break.png'));
await writeFile(path.join(publicDir, 'chime.wav'), chimeWav());

console.log('Generated icons, notification icons and chime in public/.');
