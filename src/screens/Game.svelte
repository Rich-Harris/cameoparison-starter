<script>
	import { createEventDispatcher } from 'svelte';
	import { fly, scale, crossfade } from 'svelte/transition';
	import * as eases from 'svelte/easing';
	import Card from '../components/Card.svelte';
	import { sleep, pick_random, load_image } from '../utils.js';

	export let selection;

	const dispatch = createEventDispatcher();

	const [send, receive] = crossfade({
		easing: eases.cubicOut,
		duration: 300
	});

	const load_details = async (celeb) => {
		const res = await fetch(`https://cameo-explorer.netlify.app/celebs/${celeb.id}.json`);
		const details = await res.json();
		await load_image(details.image);
		return details;
	};

	const promises = selection.map(round => Promise.all([
		load_details(round.a),
		load_details(round.b)
	]));

	const results = Array(selection.length);

	$: score = results.filter(x => x === 'right').length;

	let last_result;
	let done = false;
	let ready = true;

	const pick_message = p => {
		if (p <= 0.2) return pick_random([`Oof.`, `Better luck next time?`]);
		if (p <= 0.5) return pick_random([`I've seen worse`, `Keep trying!`]);
		if (p <= 0.8) return pick_random([`Yeah!`, `Not bad. Practice makes perfect`]);
		if (p < 1) return pick_random([`Impressive.`]);
		return pick_random([`Flawless victory`, `Top marks`]);
	};

	const submit = async (a, b, sign) => {
		last_result = Math.sign(a.price - b.price) === sign
			? 'right'
			: 'wrong';

		await sleep(1500);

		results[i] = last_result;
		last_result = null;

		await sleep(500);

		if (i < selection.length - 1) {
			i += 1;
		} else {
			done = true;
		}
	};

	let i = 0;
</script>

<header>
	<p>Tap on the more monetisable celebrity's face, or tap 'same price' if society values them equally.</p>
</header>

<div class="game-container">
	{#if done}
		<div class="done" in:scale={{delay:200, duration: 800, easing:eases.elasticOut}}>
			<strong>{score}/{results.length}</strong>
			<p>{pick_message(score / results.length)}</p>
			<button on:click={() => dispatch('restart')}>Back to main screen</button>
		</div>
	{:else if ready}
		{#await promises[i] then [a, b]}
			<div
				class="game"
				in:fly={{duration:200,y:20}}
				out:fly={{duration:200,y:-20}}
				on:outrostart={() => ready = false}
				on:outroend={() => ready = true}
			>
				<div class="card-container">
					<Card
						celeb={a}
						on:select={() => submit(a, b, 1)}
						showprice={!!last_result}
						winner={a.price >= b.price}
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
						showprice={!!last_result}
						winner={b.price >= a.price}
					/>
				</div>
			</div>
		{:catch}
			<p class="error">Oops! Failed to load data</p>
		{/await}
	{/if}
</div>

{#if last_result}
	<img
		in:fly={{duration: 200, x: 100}}
		out:send={{key: i}}
		class="giant-result"
		alt="{last_result} answer"
		src="/icons/{last_result}.svg"
	>
{/if}

<div class="results" style="grid-template-columns: repeat({results.length}, 1fr)">
	{#each results as result, i}
		<span class="result">
			{#if result}
				<img
					in:receive={{key: i}}
					alt="{result} answer"
					src="/icons/{result}.svg"
				>
			{/if}
		</span>
	{/each}
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

	.giant-result {
		position: fixed;
		width: 50vmin;
		height: 50vmin;
		left: calc(50vw - 25vmin);
		top: calc(50vh - 25vmin);
		opacity: 0.5;
	}

	.results {
		display: grid;
		grid-gap: 0.2em;
		width: 100%;
		max-width: 320px;
		margin: 1em auto 0 auto;
	}

	.result {
		background: rgba(255,255,255,0.1);
		border-radius: 50%;
		padding: 0 0 100% 0;
		transition: background 0.2s;
		transition-delay: 0.2s;
	}

	.result img {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	.done {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.done strong {
		font-size: 6em;
		font-weight: 700;
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