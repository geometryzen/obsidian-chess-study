import { JgnMove } from '../store/JgnMove';
import { ChessStudyNode } from '../tree/ChessStudyNode';

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
	left: ChessStudyNode | null,
	right: ChessStudyNode | null,
): ChessStudyNode {
	return new ChessStudyNode(
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
