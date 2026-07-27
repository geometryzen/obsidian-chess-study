import {
	NAG_poor_move,
	NAG_questionable_move,
	NAG_very_poor_move,
} from '../NumericAnnotationGlyphs';
import { NeoMove } from './NeoMove';

/**
 * A questionable move is sometimes thought of as an Inaccuracy.
 */
export function is_questionable_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_questionable_move);
}

/**
 * A poor move is sometimes thought of as a Mistake.
 */
export function is_poor_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_poor_move);
}

/**
 * A very poor move is sometimes thought of as a Blunder.
 */
export function is_very_poor_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_very_poor_move);
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
