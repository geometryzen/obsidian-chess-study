import { JgnMove } from '../jgn/JgnMove';
import { NeoMove } from '../tree/NeoMove';

export function node_from_move_and_links(
	move: Pick<
		JgnMove,
		| 'after'
		| 'clock'
		| 'color'
		| 'comment'
		| 'evaluation'
		| 'from'
		| 'moveId'
		| 'nags'
		| 'promotion'
		| 'san'
		| 'shapes'
		| 'to'
	>,
	left: NeoMove | null,
	right: NeoMove | null,
): NeoMove {
	return new NeoMove(
		move.after,
		move.clock,
		move.color,
		move.comment,
		move.evaluation,
		move.from,
		move.moveId,
		move.nags,
		move.promotion,
		move.san,
		move.shapes,
		move.to,
		left,
		right,
	);
}
