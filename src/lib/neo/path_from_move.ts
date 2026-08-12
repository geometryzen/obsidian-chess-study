import { get_prev_move } from './get_prev_move';
import { NeoMove } from './NeoMove';

/**
 *
 * @param root
 * @param move
 * @returns
 */
export function path_from_move(
	root: NeoMove | null,
	move: NeoMove | null,
): string[] {
	const path: string[] = [];
	let x: NeoMove | null = move;
	while (x) {
		path.push(x.san);
		x = get_prev_move(root, x);
	}
	path.reverse();
	return path;
}
