<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	function trimmedPreview(preview: string): string {
		if (preview.length > 180) {
			return preview.substring(0, 180) + '...';
		}
		return preview;
	}
</script>

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
