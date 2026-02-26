import { JgnContent } from '../store/JgnContent';
import { JgnMove, JgnVariation } from '../store/JgnMove';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { ChessStudyNode } from '../tree/ChessStudyNode';

export function model_from_jgn(fileContent: JgnContent): {
	model: ChessStudyModel;
	version: string;
} {
	const comment = fileContent.comment;
	const headers = fileContent.headers;
	const root: ChessStudyNode | null = node_from_jgn_moves(fileContent.moves);
	const rootFEN = fileContent.rootFEN;
	return {
		model: new ChessStudyModel(comment, headers, root, rootFEN),
		version: fileContent.version,
	};
}

function node_from_jgn_moves(ms: JgnMove[]): ChessStudyNode | null {
	// Make a copy because we are going to mutate
	const moves = [...ms];
	if (Array.isArray(moves)) {
		// We will grow the tree from the bottom
		let left: ChessStudyNode | null = null;
		while (moves.length > 0) {
			const move = moves.pop() as JgnMove;
			let right: ChessStudyNode | null = null;
			const variations = [...move.variants];
			while (variations.length > 0) {
				const variation = variations.pop() as JgnVariation;
				// The variation identifier has been dropped.
				// The owner or parent identifier has been dropped.
				// These could be passed in to provide back-pointing identifiers?
				variation.variantId;
				variation.parentMoveId;
				right = node_from_jgn_moves(variation.moves);
			}
			left = new ChessStudyNode(
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
		return left;
	} else {
		throw new Error('moves must be an array');
	}
}
