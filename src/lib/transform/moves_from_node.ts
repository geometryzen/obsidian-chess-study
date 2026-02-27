import { JgnMove, JgnVariation } from '../jgn/JgnMove';
import { ChessStudyNode } from '../tree/ChessStudyNode';
import { move_from_node_and_variations } from './move_from_node_and_variations';

export function moves_from_node(node: ChessStudyNode | null): JgnMove[] {
	if (node) {
		const following_moves = moves_from_node(node.left);
		const variations = variations_from_node(node.right, node.id);
		const move = move_from_node_and_variations(node, variations);
		return [move, ...following_moves];
	} else {
		return [];
	}
}

function variations_from_node(
	node: ChessStudyNode | null,
	parentMoveId: string,
): JgnVariation[] {
	if (node) {
		const following_variations = variations_from_node(node.right, parentMoveId);
		const following_moves = moves_from_node(node.left);
		const move = move_from_node_and_variations(node, []);
		const variation: JgnVariation = {
			parentMoveId,
			moves: [move, ...following_moves],
		};
		return [variation, ...following_variations];
	} else {
		return [];
	}
}
