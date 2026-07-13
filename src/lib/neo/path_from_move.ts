import { find_parent } from './find_parent';
import { NeoMove } from './NeoMove';

export function path_from_move(
	root: NeoMove | null,
	move: NeoMove | null,
): string[] {
	const path: string[] = [];
	let x: NeoMove | null = move;
	while (x) {
		path.push(x.san);
		x = find_parent(root, x);
	}
	path.reverse();
	return path;
}
