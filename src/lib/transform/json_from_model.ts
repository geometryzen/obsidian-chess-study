import { ChessStudyFileContent } from '../store/ChessStudyFileContent';
import { ChessStudyFileMove } from '../store/ChessStudyFileMove';
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
		// These are the follwing moves.
		const following = moves_from_node(node.left);
		// These are the variations for this node
		const x: ChessStudyFileMove = {
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
			variants: [],
			clock: node.clock,
			evaluation: node.evaluation,
		};
		// moves_from_node(node.right)
		return [x, ...following];
	} else {
		return [];
	}
}
