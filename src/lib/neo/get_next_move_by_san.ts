import { get_next_move } from './get_next_move';
import { get_variation_next } from './get_variation_next';
import { NeoMove } from './NeoMove';

export function get_next_move_by_san(
	move: NeoMove | null,
	san: string,
	root: NeoMove,
): NeoMove | null {
	let candidate = move ? get_next_move(move) : root;
	while (candidate) {
		if (candidate.san === san) {
			return candidate;
		}
		candidate = get_variation_next(candidate);
	}
	return null;
}
