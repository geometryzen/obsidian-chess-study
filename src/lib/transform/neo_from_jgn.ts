import { JgnStudy } from '../jgn/JgnStudy';
import { JgnMove, JgnVariation } from '../jgn/JgnMove';
import { NeoStudy } from '../neo/NeoStudy';
import { NeoMove } from '../neo/NeoMove';
import { head_and_remaining } from './head_and_remaining';
import { node_from_move_and_links } from './node_from_move_and_links';

export function neo_from_jgn(jgnStudy: JgnStudy): NeoStudy {
	const comment = jgnStudy.comment;
	const headers = jgnStudy.headers;
	const root: NeoMove | null = node_from_jgn_moves(jgnStudy.moves);
	const rootFEN = jgnStudy.rootFEN;
	return new NeoStudy(comment, headers, root, rootFEN);
}

function node_from_jgn_moves(moves: JgnMove[]): NeoMove | null {
	if (moves.length > 0) {
		const { x: move, remaining } = head_and_remaining(moves);
		const left = node_from_jgn_moves(remaining);
		const right: NeoMove | null = node_from_jgn_variations(move.variants);
		return node_from_move_and_links(move, left, right);
	} else {
		return null;
	}
}

function node_from_jgn_variations(vs: JgnVariation[]): NeoMove | null {
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
