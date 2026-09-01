/**
 * Generates the raster images that browsers and link unfurlers cannot take as
 * SVG: the iOS home-screen icon and the Open Graph card.
 *
 * The SVG sources live here rather than in public/ because they are build
 * inputs, not assets to serve — public/favicon.svg is the only vector that
 * actually ships.
 *
 *   node scripts/gen-images.mjs
 *
 * Fonts: Inter is loaded from Google Fonts at runtime on the site, but it is
 * not installed system-wide, and fontconfig falls back to Verdana — far too
 * wide to pass for the wordmark. So the faces below are pinned to ones macOS
 * ships, matching the fallbacks already declared in global.css.
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Straight from the @theme block in src/styles/global.css.
const INK = '#05060d';
const CHALK = '#eef1ff';
const MUTE = '#a7adcc';
const VIOLET = '#6b3bff';
const CYAN = '#22d3ee';
const MAGENTA = '#ff3ea5';
// The wordmark sheen mixes both accents toward white; precomputed here so the
// gradients stay readable.
const CYAN_LIT = '#43daf1';
const MAGENTA_LIT = '#ff65b7';

const SANS = 'Helvetica Neue';
const MONO = 'Menlo';

/** The lowercase f, sized for a 64-unit box — same geometry as favicon.svg. */
const GLYPH = `
  <g fill="none" stroke="url(#sheen)" stroke-width="6.5" stroke-linecap="round">
    <path d="M43 15c-8-3-12 0.5-12 8V49"/>
    <path d="M22 29h20"/>
  </g>`;

/**
 * iOS applies its own squircle mask to this, so it is deliberately full-bleed:
 * baking in the favicon's rounded corners would leave dark wedges outside the
 * mask.
 */
const appleTouchIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="14" y1="10" x2="52" y2="52">
      <stop offset="0%" stop-color="${CHALK}"/>
      <stop offset="50%" stop-color="${CHALK}"/>
      <stop offset="60%" stop-color="${CYAN_LIT}"/>
      <stop offset="70%" stop-color="${MAGENTA_LIT}"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.28" cy="0.2" r="0.62">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" fill="${INK}"/>
  <rect width="64" height="64" fill="url(#bloom)"/>
  ${GLYPH}
</svg>`;

/**
 * 1200x630 is the size X, Slack, Discord and iMessage all render without
 * re-cropping. Content is kept well inside the edges because some clients
 * still trim to a squarer aspect.
 */
const ogCard = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="420" y1="300" x2="800" y2="430">
      <stop offset="0%" stop-color="${CHALK}"/>
      <stop offset="38%" stop-color="${CHALK}"/>
      <stop offset="50%" stop-color="${CYAN_LIT}"/>
      <stop offset="60%" stop-color="${MAGENTA_LIT}"/>
      <stop offset="72%" stop-color="${CHALK}"/>
      <stop offset="100%" stop-color="${CHALK}"/>
    </linearGradient>
    <radialGradient id="violetBloom" cx="0.14" cy="0.1" r="0.55">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="magentaBloom" cx="0.9" cy="0.96" r="0.5">
      <stop offset="0%" stop-color="${MAGENTA}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${MAGENTA}" stop-opacity="0"/>
    </radialGradient>
    <!-- Mirrors .grid-veil: 72px cells, faded toward the edges so it reads as
         texture rather than a table. -->
    <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
      <path d="M72 0H0V72" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <radialGradient id="veilFade" cx="0.5" cy="0.45" r="0.62">
      <stop offset="25%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="veilMask">
      <rect width="1200" height="630" fill="url(#veilFade)"/>
    </mask>
  </defs>

  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#grid)" mask="url(#veilMask)"/>
  <rect width="1200" height="630" fill="url(#violetBloom)"/>
  <rect width="1200" height="630" fill="url(#magentaBloom)"/>

  <text x="600" y="212" text-anchor="middle" font-family="${MONO}" font-size="21"
        letter-spacing="8.4" fill="${MUTE}">SOFTWARE ENGINEER</text>

  <text x="600" y="410" text-anchor="middle" font-family="${SANS}" font-weight="bold"
        font-size="188" letter-spacing="-7" fill="url(#sheen)">fbex</text>

  <text x="600" y="492" text-anchor="middle" font-family="${MONO}" font-size="27" fill="${MUTE}">
    <tspan fill="${CYAN}">&gt;</tspan> building things that ship
  </text>
</svg>`;

const targets = [
  ['public/apple-touch-icon.png', appleTouchIcon, 180, 180],
  ['public/og.png', ogCard, 1200, 630],
];

for (const [path, svg, width, height] of targets) {
  const png = await sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
  await writeFile(path, png);
  console.log(`${path}  ${width}x${height}  ${(png.length / 1024).toFixed(1)} kB`);
}
