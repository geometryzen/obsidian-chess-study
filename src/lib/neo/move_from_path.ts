import { get_next_moves } from './get_next_moves';
import { NeoMove } from './NeoMove';

export function moves_from_path(
	root: NeoMove | null | undefined,
	sans: string[],
): NeoMove[] {
	const moves: NeoMove[] = [];
	if (root) {
		let candidates: NeoMove[] = [root];
		for (const san of sans) {
			let found = false;
			for (const candidate of candidates) {
				if (candidate.san === san) {
					moves.push(candidate);
					found = true;
					candidates = get_next_moves(candidate);
					break;
				}
			}
			if (!found) {
				break;
			}
		}
	}
	return moves;
}
