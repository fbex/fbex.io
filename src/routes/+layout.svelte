<script>
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	// use Vercel web analytics
	inject({ mode: dev ? 'development' : 'production' });
</script>

<Header />
<slot />
<Footer />
