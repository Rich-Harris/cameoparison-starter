<script>
	import Card from '../components/Card.svelte';

	export let selection;

	const load_details = async (celeb) => {
		const res = await fetch(`https://cameo-explorer.netlify.app/celebs/${celeb.id}.json`);
		return await res.json();
	};

	const promises = selection.map(round => Promise.all([
		load_details(round.a),
		load_details(round.b)
	]));

	const submit = (a, b, sign) => {
		const result = Math.sign(a.price - b.price) === sign
			? 'right'
			: 'wrong';

		console.log({ result });

		if (i < selection.length - 1) {
			i += 1;
		} else {
			// TODO end the game
		}
	};

	let i = 0;
</script>

<header>
	<p>Tap on the more monetisable celebrity's face, or tap 'same price' if society values them equally.</p>
</header>

<div class="game-container">
	{#await promises[i] then [a, b]}
		<div class="game">
			<div class="card-container">
				<Card
					celeb={a}
					on:select={() => submit(a, b, 1)}
				/>
			</div>

			<div>
				<button class="same" on:click={() => submit(a, b, 0)}>
					same price
				</button>
			</div>

			<div class="card-container">
				<Card
					celeb={b}
					on:select={() => submit(a, b, -1)}
				/>
			</div>
		</div>
	{:catch}
		<p class="error">Oops! Failed to load data</p>
	{/await}
</div>

<div class="results">
	<p>results will go here</p>
</div>

<style>
	.game-container {
		flex: 1;
	}

	.game {
		display: grid;
		grid-template-rows: 1fr 2em 1fr;
		grid-gap: 0.5em;
		width: 100%;
		height: 100%;
		max-width: min(100%, 40vh);
		margin: 0 auto;
	}

	.game > div {
		display: flex;
		align-items: center;
	}

	.same {
		width: 100%;
		align-items: center;
		margin: 0;
	}

	.game .card-container button {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}

	.error {
		color: red;
	}

	@media (min-width: 640px) {
		.game {
			max-width: 100%;
			grid-template-rows: none;
			grid-template-columns: 1fr 8em 1fr;

			/* work around apparent safari flex bug */
			max-height: calc(100vh - 6em);
		}

		.same {
			height: 8em;
		}
	}
</style>