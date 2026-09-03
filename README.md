# fbex.io

Personal landing page, live at [fbex.io](https://fbex.io). One screen: the
wordmark, a role line, and social links over an animated WebGL field.

## Stack

| Piece | Why |
| --- | --- |
| [Astro](https://astro.build) 7 | Static HTML output, no client JS by default. Content collections are ready for the projects and blog on the roadmap. |
| TypeScript (strict) | `astro check` runs inside `npm run build`. |
| [Tailwind CSS](https://tailwindcss.com) 4 | Loaded through `@tailwindcss/vite`. Design tokens live in the `@theme` block in `src/styles/global.css`. |
| [OGL](https://github.com/oframe/ogl) | A 10 kB WebGL layer for the backdrop. three.js would weigh about 15 times as much for one full-screen quad. |
| [GSAP](https://gsap.com) | Drives the entrance timeline and the magnetic hover on the social links. |

The build writes plain static files. It deploys unchanged to Cloudflare
Pages, Vercel, Netlify, GitHub Pages, or any other static host. Nothing
host-specific is configured.

## Commands

```bash
npm install
npm run dev         # http://localhost:4321
npm run build       # astro check, then astro build  ->  dist/
npm run preview     # serve the built site
npm run gen:images  # rebuild public/og.png and public/apple-touch-icon.png
```

The repo targets Node 24, pinned in `.nvmrc`. If your shell defaults to
another version, run `nvm use`.

`npm run gen:images` renders the Open Graph card and the iOS home-screen icon
to PNG. The SVG sources are inline in `scripts/gen-images.mjs`. The PNGs are
committed, not generated on deploy. After you change the wordmark or the
`@theme` tokens in `src/styles/global.css`, run the command again and commit
the result.

## Site content

[`src/data/site.ts`](src/data/site.ts) holds every personal detail: the
handle, the social links, the phrases the role line cycles through, and the
meta description. Edit that file and nothing else.

To add a social link:

1. Append an entry to `socials` in `src/data/site.ts`.
2. Add the icon name to the `SocialLink['icon']` union in the same file.
3. Add the matching SVG to the icon map in
   [`src/components/Icon.astro`](src/components/Icon.astro).

## The backdrop

The backdrop is one full-screen triangle running a domain-warped fBm noise
shader, defined in [`src/lib/backdrop.ts`](src/lib/backdrop.ts). It has three
fallbacks. Without WebGL, the canvas stays empty and the CSS radial gradient
behind it shows through. Under `prefers-reduced-motion`, the shader draws one
static frame and the animation loop stops. While the tab is hidden, rendering
pauses.

## Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org).
The format is `type(scope): summary`, for example `feat(socials): add
Bluesky`.

Branches follow [Conventional Branch](https://conventionalbranch.org). The
format is `type/description`, for example `feat/projects-collection`.

## License

No license. The code is public to read, not to redeploy. If you want to reuse
part of it, ask first.
