import { find_parent } from './find_parent';
import { get_next_move } from './get_next_move';
import { get_prev_move } from './get_prev_move';
import { NeoMove } from './NeoMove';

/**
 * Determines whether a is the parent
 * @param a
 * @param b
 */
export function is_parent(root: NeoMove, a: NeoMove, b: NeoMove): boolean {
	return find_parent(root, b) === a;
}

export function is_prior_move(
	root: NeoMove | null,
	a: NeoMove,
	b: NeoMove | null,
): boolean {
	if (!root) {
		return false;
	}
	if (!b) {
		// Strictly speaking we cannot say.
		return false;
	}
	if (a === b) {
		// same, so it is not prior.
		return false;
	}
	const priors: NeoMove[] = [];
	let x = get_prev_move(root, b);
	while (x) {
		priors.push(x);
		x = get_prev_move(root, x);
	}
	for (const prior of priors) {
		if (prior === a) {
			return true;
		}
	}
	return false;
}

export function is_main_line(a: NeoMove, b: NeoMove | null): boolean {
	if (!b) {
		// Strictly speaking we cannot say.
		return false;
	}
	if (a === b) {
		// same, so it is not prior.
		return false;
	}
	const moves: NeoMove[] = [];
	let x = get_next_move(b);
	while (x) {
		moves.push(x);
		x = get_next_move(x);
	}
	for (const move of moves) {
		if (move === a) {
			return true;
		}
	}
	return false;
}
