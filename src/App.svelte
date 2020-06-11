<script>
	let state = 'welcome'; // 'welcome' or 'playing'
</script>

<main>
	{#if state === 'welcome'}
		<p>welcome screen goes here</p>
	{:else if state === 'playing'}
		<p>game screen goes here</p>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
</style>