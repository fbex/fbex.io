<script>
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	// inject vercel web analytics and speed insights
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<Header />
<slot />
<Footer />
