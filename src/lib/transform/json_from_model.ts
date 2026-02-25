import { ChessStudyFileContent } from '../store/ChessStudyFileContent';
import {
	ChessStudyFileMove,
	ChessStudyFileVariation,
} from '../store/ChessStudyFileMove';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { ChessStudyNode } from '../tree/ChessStudyNode';

export function json_from_model(
	model: ChessStudyModel,
	version: string,
): ChessStudyFileContent {
	const fileContents: ChessStudyFileContent = {
		version: version,
		comment: model.comment,
		headers: model.headers,
		rootFEN: model.rootFEN,
		moves: moves_from_node(model.root), // We must compute the moves from the model.root.
	};
	return fileContents;
}

function moves_from_node(node: ChessStudyNode | null): ChessStudyFileMove[] {
	if (node) {
		const following_moves = moves_from_node(node.left);
		const move: ChessStudyFileMove = {
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
			variants: variations_from_node(node.right),
			clock: node.clock,
			evaluation: node.evaluation,
		};
		return [move, ...following_moves];
	} else {
		return [];
	}
}

function variations_from_node(
	node: ChessStudyNode | null,
): ChessStudyFileVariation[] {
	if (node) {
		const following_variations = variations_from_node(node.right);
		const variation: ChessStudyFileVariation = {
			parentMoveId: '',
			variantId: '',
			moves: moves_from_node(node.left),
		};
		return [variation, ...following_variations];
	} else {
		return [];
	}
}
