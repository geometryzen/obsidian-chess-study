import { JgnMove, JgnVariation } from '../store/JgnMove';
import { ChessStudyNode } from '../tree/ChessStudyNode';

export function move_from_node_and_variations(
	node: Pick<
		ChessStudyNode,
		| 'after'
		| 'color'
		| 'comment'
		| 'from'
		| 'id'
		| 'nags'
		| 'promotion'
		| 'san'
		| 'shapes'
		| 'to'
		| 'clock'
		| 'evaluation'
	>,
	variations: JgnVariation[],
): JgnMove {
	const move: JgnMove = {
		after: node.after,
		color: node.color,
		comment: node.comment,
		from: node.from,
		moveId: node.id,
		nags: node.nags,
		promotion: node.promotion,
		san: node.san,
		shapes: node.shapes,
		to: node.to,
		variants: variations,
		clock: node.clock,
		evaluation: node.evaluation,
	};
	return move;
}
