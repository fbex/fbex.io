// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Static output — deployable to Cloudflare Pages, Vercel, Netlify, GitHub
  // Pages or any static host without changing anything here.
  output: 'static',
  site: 'https://fbex.io',
  server: {
    // Astro's CLI does not read PORT by itself, so the dev-server launcher's
    // assigned port has to be wired in here. Falls back to Astro's default.
    port: Number(process.env.PORT) || 4321,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
