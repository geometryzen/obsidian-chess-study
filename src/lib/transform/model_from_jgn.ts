import { JgnContent } from '../jgn/JgnContent';
import { JgnMove, JgnVariation } from '../jgn/JgnMove';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { ChessStudyNode } from '../tree/ChessStudyNode';
import { head_and_remaining } from './head_and_remaining';
import { node_from_move_and_links } from './node_from_move_and_links';

export function model_from_jgn(fileContent: JgnContent): ChessStudyModel {
	const comment = fileContent.comment;
	const headers = fileContent.headers;
	const root: ChessStudyNode | null = node_from_jgn_moves(fileContent.moves);
	const rootFEN = fileContent.rootFEN;
	return new ChessStudyModel(comment, headers, root, rootFEN);
}

function node_from_jgn_moves(moves: JgnMove[]): ChessStudyNode | null {
	if (moves.length > 0) {
		const { x: move, remaining } = head_and_remaining(moves);
		const left = node_from_jgn_moves(remaining);
		const right: ChessStudyNode | null = node_from_jgn_variations(move.variants);
		return node_from_move_and_links(move, left, right);
	} else {
		return null;
	}
}

function node_from_jgn_variations(vs: JgnVariation[]): ChessStudyNode | null {
	if (vs.length > 0) {
		const { x: head_vs, remaining: rem_vs } = head_and_remaining(vs);
		const right = node_from_jgn_variations(rem_vs);
		const { x: head_move, remaining: rem_moves } = head_and_remaining(
			head_vs.moves,
		);
		const left = node_from_jgn_moves(rem_moves);
		return node_from_move_and_links(head_move, left, right);
	} else {
		return null;
	}
}
