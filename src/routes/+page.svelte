<script lang="ts">
	import logo from '$lib/images/fbex.svg';
	import { title } from '$lib/info';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Building software and writing about stuff." />
	<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="RSS Feed" />
</svelte:head>

<main>
	<div class="hero min-h-[calc(100vh-250px-88px)] bg-base-200">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<img src={logo} width="600" height="600" alt="fbex logo" />
				<div class="grid text-center sm:max-w-5xl sm:grid-cols-2 sm:text-left sm:mx-11">
					<a
						href={'/notes'}
						class="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
					>
						<h2 class={`mb-3 text-2xl font-semibold`}>
							Notes{' '}
							<span
								class="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
								>-&gt;</span
							>
						</h2>
						<p class={`m-0 text-sm opacity-50`}>Stuff I write about.</p>
					</a>
					<a
						href="https://github.com/fbex"
						class="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
						target="_blank"
						rel="noopener noreferrer"
					>
						<h2 class={`mb-3 text-2xl font-semibold`}>
							Projects{' '}
							<span
								class="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
								>-&gt;</span
							>
						</h2>
						<p class={`m-0 text-sm opacity-50`}>Stuff I build.</p>
					</a>
				</div>
			</div>
		</div>
	</div>
</main>
