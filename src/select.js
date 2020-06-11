import { pick_random } from './utils.js';

const ROUNDS_PER_GAME = 10;

function remove(array, index) {
	// if a 'similar' account was picked, there's no
	// guarantee that it's in the filtered array
	if (index === -1) return;

	// this is much faster than splicing the array
	array[index] = array[array.length - 1];
	array.pop();
}

export function select(celebs, lookup, category) {
	const filtered = celebs.filter(c => {
		return c.categories.includes(category);
	});

	const seen = new Set();
	const selection = [];

	let i = ROUNDS_PER_GAME;
	while (i--) {
		const n = Math.random();
		const ai = Math.floor(n * filtered.length);
		const a = filtered[ai];

		// remove a from the array so this person can't be picked again
		remove(filtered, ai);

		let b;

		// if this celeb has 'similar' celebs, decide whether to pick one
		const similar = a.similar.filter(id => !seen.has(id));
		if ((similar.length > 0) && (Math.random() < 0.75)) {
			const id = pick_random(similar);
			b = lookup.get(id);
		}

		// otherwise pick someone at random
		else {
			b = pick_random(filtered);
		}

		selection.push({ a, b });

		seen.add(a.id);
		seen.add(b.id);

		// remove b from the array so this person can't be picked again
		remove(filtered, filtered.indexOf(b));
	}

	return selection;
}