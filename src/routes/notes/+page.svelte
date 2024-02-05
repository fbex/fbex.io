<script lang="ts">
	import type { PageServerData } from './$types';
	import { title } from '$lib/info';

	export let data: PageServerData;

	function trimmedPreview(preview: string): string {
		if (preview.length > 180) {
			return preview.substring(0, 180) + '...';
		}
		return preview;
	}
</script>

<svelte:head>
	<title>Notes | {title}</title>
	<meta name="description" content="Collection of blog posts" />
</svelte:head>

<h1>Notes</h1>
<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
	{#each data.posts as post}
		<div class="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
			<a href={`/notes/${post.slug}`} class="no-underline font-normal text-inherit">
				<div class="card-body">
					<h2 class="card-title">{post.title}</h2>
					<p>{trimmedPreview(post.preview.text)}</p>
				</div>
			</a>
		</div>
	{/each}
</div>
