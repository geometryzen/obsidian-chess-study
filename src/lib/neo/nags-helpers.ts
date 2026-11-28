import { MoveAnnotation } from '../classification';
import {
	NAG_excellent_move,
	NAG_good_move,
	NAG_poor_move,
	NAG_questionable_move,
	NAG_speculative_move,
	NAG_very_poor_move,
} from '../NumericAnnotationGlyphs';
import { NeoMove } from './NeoMove';

/**
 * A questionable move is sometimes thought of as an Inaccuracy.
 */
export function is_questionable_move(move: NeoMove): boolean {
	return is_questionable_nags(move.nags);
}

export function is_questionable_nags(nags: number[]): boolean {
	return nags.contains(NAG_questionable_move);
}

export function is_interesting_move(move: NeoMove): boolean {
	return is_interesting_nags(move.nags);
}

export function is_interesting_nags(nags: number[]): boolean {
	return nags.contains(NAG_speculative_move);
}

/**
 * A poor move is sometimes thought of as a Mistake.
 */
export function is_poor_move(move: NeoMove): boolean {
	return is_poor_nags(move.nags);
}

export function is_poor_nags(nags: number[]): boolean {
	return nags.contains(NAG_poor_move);
}

/**
 * A very poor move is sometimes thought of as a Blunder.
 */
export function is_very_poor_move(move: NeoMove): boolean {
	return is_very_poor_nags(move.nags);
}

export function is_very_poor_nags(nags: number[]): boolean {
	return nags.contains(NAG_very_poor_move);
}

/**
 * An error is either an Inaccuracy or a Mistake of a Blunder.
 */
export function is_error_move(move: NeoMove): boolean {
	return (
		is_questionable_move(move) || is_poor_move(move) || is_very_poor_move(move)
	);
}

/**
 * An correct move is not an error move.
 */
export function is_correct_move(move: NeoMove): boolean {
	return !is_error_move(move);
}

export function is_good_move(move: NeoMove): boolean {
	return is_good_nags(move.nags);
}

export function is_good_nags(nags: number[]): boolean {
	return nags.contains(NAG_good_move);
}

export function is_excellent_move(move: NeoMove): boolean {
	return is_excellent_nags(move.nags);
}

export function is_excellent_nags(nags: number[]): boolean {
	return nags.contains(NAG_excellent_move);
}

export function move_annotation(move: NeoMove | null): MoveAnnotation | null {
	if (move) {
		return nags_annotation(move.nags);
	} else {
		return null;
	}
}

export function nags_annotation(nags: number[]): MoveAnnotation | null {
	if (is_excellent_nags(nags)) {
		return 'bangbang';
	}
	if (is_good_nags(nags)) {
		return 'bang';
	}
	if (is_interesting_nags(nags)) {
		return 'bangqmark';
	}
	if (is_questionable_nags(nags)) {
		return 'qmarkbang';
	}
	if (is_poor_nags(nags)) {
		return 'qmark';
	}
	if (is_very_poor_nags(nags)) {
		return 'qmarkqmark';
	}
	return null;
}
