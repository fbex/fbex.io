import { browser } from '$app/environment';
import { format } from 'date-fns';
import { parse } from 'node-html-parser';
import type { SvelteComponent } from 'svelte';

type Path = string; // The file path
type Module = {
	default: SvelteComponent; // The Svelte Component
	metadata: Record<string, unknown>; // An object containing the frontmatter
};
type Writings = [Path, Module][];

export type PostMetadata = Post & {
	next: Post;
	previous: Post;
};

export type Post = {
	title: string;
	date: string;
	slug: string;
	isIndexFile: boolean;
	preview: {
		html: string;
		text: string;
	};
};

// we require some server-side APIs to parse all metadata
if (browser) {
	throw new Error(`posts can only be imported server-side`);
}

const glob_import: Record<string, Module> = import.meta.glob<Module>(
	'../../content/posts/**/*.md',
	{
		eager: true
	}
);
const writings: Writings = Object.entries(glob_import);

// Get all posts and add metadata
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const posts: PostMetadata[] = writings
	.map(([filepath, module]) => {
		const html = parse(module.default.render().html);
		const preview = module.metadata.preview
			? parse(module.metadata.preview as string)
			: html.querySelector('p');

		return {
			...module.metadata,

			// generate the slug from the file path
			slug: filepath
				.replace(/(\/index)?\.md/, '')
				.split('/')
				.pop(),

			// whether this file is `my-post.md` or `my-post/index.md`
			// (needed to do correct dynamic import in posts/[slug].svelte)
			isIndexFile: filepath.endsWith('/index.md'),

			// format date as yyyy-MM-dd
			date: module.metadata.date
				? format(
						// offset by timezone so that the date is correct
						addTimezoneOffset(new Date(module.metadata.date as string)),
						'yyyy-MM-dd'
					)
				: undefined,

			preview: {
				html: preview!.toString(),
				// text-only preview (i.e. no html elements), used for SEO
				text: preview!.structuredText ?? preview!.toString()
			}
		};
	})
	// sort by date
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	// add references to the next/previous post
	.map((post, index, allPosts) => ({
		...post,
		next: allPosts[index - 1],
		previous: allPosts[index + 1]
	}));

function addTimezoneOffset(date: string | number | Date) {
	const offsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000;
	return new Date(new Date(date).getTime() + offsetInMilliseconds);
}
