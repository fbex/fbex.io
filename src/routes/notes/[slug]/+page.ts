import type { PageLoad } from './$types';

/**
 * Dynamically loads the svelte component for the post (only possible in +page.ts)
 * and pass on the data from +page.server.js
 */
export const load: PageLoad = async ({ data }) => {
	// load the markdown file based on slug
	const component = data.note.isIndexFile
		? // vite requires relative paths and explicit file extensions for dynamic imports
			// see https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
			await import(`../../../content/posts/${data.note.slug}/index.md`)
		: await import(`../../../content/posts/${data.note.slug}.md`);

	return {
		post: data.note,
		component: component.default
	};
};
