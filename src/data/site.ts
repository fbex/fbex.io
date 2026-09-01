/**
 * Single source of truth for everything personal on the site.
 * Edit here — nothing else needs to change.
 */

export interface SocialLink {
  /** Shown on hover and used as the accessible label. */
  name: string;
  url: string;
  /** Key into the icon map in components/Icon.astro */
  icon: 'github' | 'x' | 'bluesky' | 'mastodon';
  /** Shown next to the name in the hover row. */
  handle: string;
}

export const site = {
  handle: 'fbex',
  title: 'fbex — software engineer',
  description:
    'fbex — software engineer. Building fast, considered software for the web and beyond.',
  url: 'https://fbex.io',

  /** Cycled through by the scramble effect under the wordmark. */
  roles: [
    'building things that ship',
    'systems & interfaces',
    'web, tooling & infrastructure',
  ],

  socials: [
    { name: 'GitHub', url: 'https://github.com/fbex', icon: 'github', handle: '@fbex' },
    { name: 'X', url: 'https://x.com/fbex0v', icon: 'x', handle: '@fbex0v' },
    { name: 'Bluesky', url: 'https://bsky.app/profile/fbex.bsky.social', icon: 'bluesky', handle: '@fbex' },
    { name: 'Mastodon', url: 'https://mastodon.social/@fbex', icon: 'mastodon', handle: '@fbex' },
  ] satisfies SocialLink[],
} as const;
