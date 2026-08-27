# fbex.io

Personal landing page. One screen: wordmark, role line, socials — over an
animated WebGL field.

## Stack

| Piece | Why |
| --- | --- |
| [Astro](https://astro.build) 7 | Static output, zero JS by default. Content collections are already available for the projects/blog on the roadmap. |
| TypeScript (strict) | `astro check` runs as part of `npm run build`. |
| [Tailwind CSS](https://tailwindcss.com) 4 | Via `@tailwindcss/vite`. Design tokens live in `@theme` in `src/styles/global.css`. |
| [OGL](https://github.com/oframe/ogl) | ~10kb WebGL layer for the animated backdrop — three.js would be 15× the weight for one full-screen quad. |
| [GSAP](https://gsap.com) | Entrance timeline and the magnetic hover on the social links. |

Output is plain static files, so it deploys as-is to Cloudflare Pages,
Vercel, Netlify, GitHub Pages or any static host. Nothing host-specific is
configured.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check && astro build  ->  dist/
npm run preview  # serve the built site
```

Node 24 via nvm; `nvm use` before running if your shell defaults elsewhere.

## Editing your details

Everything personal — handle, socials, the phrases the role line cycles
through, meta description — lives in [`src/data/site.ts`](src/data/site.ts).
Nothing else needs touching to change a link or add one.

To add a social link, append to `socials` and add the matching SVG to the map
in [`src/components/Icon.astro`](src/components/Icon.astro).

> The social URLs are placeholders (`github.com/fbex`, `x.com/fbex`,
> `linkedin.com/in/fbex`, `hello@fbex.io`) — swap them for the real ones.

## How it fits together

```
src/
  data/site.ts            all personal content
  lib/backdrop.ts         the OGL shader field (GLSL lives here)
  lib/motion.ts           intro timeline, text scramble, magnetic hover
  components/Backdrop.astro   canvas + CSS-gradient fallback + grain/grid
  components/Hero.astro       wordmark, role line, socials
  components/SocialRail.astro
  components/Icon.astro
  layouts/Base.astro      head, fonts, meta
  pages/index.astro       page composition
```

The backdrop is a single full-screen triangle running a domain-warped fbm
noise shader. It degrades in three steps: no WebGL falls back to the CSS
radial gradient underneath the canvas; `prefers-reduced-motion` renders one
static frame and stops the loop; a hidden tab pauses rendering entirely.

## Roadmap

Not built yet, but the structure anticipates it:

- **Projects** — an Astro content collection (`src/content/projects/`) plus a
  `/projects` route, or a section on this page.
- **Blog** — a second collection with MDX, `/blog` index and `[slug]` route.

Neither needs a framework change: Astro's content layer covers both, and the
current page becomes one route among several.
