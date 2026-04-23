import { get_prev_move } from './get_prev_move';
import { NeoMove } from './NeoMove';

export function compute_move_number(move: NeoMove, root: NeoMove): number {
	const depth = compute_move_depth_recursive(root, move, 0);
	return 1 + (depth - (depth % 2)) / 2;
}

function compute_move_depth_recursive(
	root: NeoMove,
	move: NeoMove,
	moveNumber: number,
): number {
	const prev = get_prev_move(root, move);
	if (prev) {
		return compute_move_depth_recursive(root, prev, moveNumber + 1);
	} else {
		return moveNumber;
	}
}
