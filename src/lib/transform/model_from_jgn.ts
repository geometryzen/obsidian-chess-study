import { JgnContent } from '../store/JgnContent';
import { JgnMove, JgnVariation } from '../store/JgnMove';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { ChessStudyNode } from '../tree/ChessStudyNode';
import { head_and_remaining } from './head_and_remaining';

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

function node_from_jgn_moves(moves: JgnMove[]): ChessStudyNode | null {
	if (moves.length > 0) {
		const { x: move, remaining } = head_and_remaining(moves);
		const left = node_from_jgn_moves(remaining);
		const right: ChessStudyNode | null = node_from_jgn_variations(move.variants);
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
	} else {
		return null;
	}
}

function node_from_jgn_variations(
	variations: JgnVariation[],
): ChessStudyNode | null {
	if (variations.length > 0) {
		const { x: variation, remaining: remaining_variations } =
			head_and_remaining(variations);
		const right = node_from_jgn_variations(remaining_variations);
		const { x: move, remaining: following_moves } = head_and_remaining(
			variation.moves,
		);
		const left = node_from_jgn_moves(following_moves);
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
	} else {
		return null;
	}
}
