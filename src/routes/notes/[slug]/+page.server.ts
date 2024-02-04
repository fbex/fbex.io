import { posts } from '$lib/server/posts';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const note = posts.find((note) => note.slug === params.slug);

	if (!note) {
		throw error(404, 'Note not found');
	}

	return { note };
};
