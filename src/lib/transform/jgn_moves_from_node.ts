import { JgnMove, JgnVariation } from '../store/JgnMove';
import { ChessStudyNode } from '../tree/ChessStudyNode';

export function jgn_moves_from_node(node: ChessStudyNode | null): JgnMove[] {
	if (node) {
		const following_moves = jgn_moves_from_node(node.left);
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
			variants: jgn_variations_from_node(node.right),
			clock: node.clock,
			evaluation: node.evaluation,
		};
		return [move, ...following_moves];
	} else {
		return [];
	}
}

function jgn_variations_from_node(node: ChessStudyNode | null): JgnVariation[] {
	if (node) {
		const following_variations = jgn_variations_from_node(node.right);
		const variation: JgnVariation = {
			parentMoveId: '',
			variantId: '',
			moves: jgn_moves_from_node(node.left),
		};
		return [variation, ...following_variations];
	} else {
		return [];
	}
}
