export function pick_random(array) {
	const index = Math.floor(array.length * Math.random());
	return array[index];
}