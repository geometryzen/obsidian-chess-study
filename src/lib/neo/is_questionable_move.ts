import {
	NAG_poor_move,
	NAG_questionable_move,
	NAG_very_poor_move,
} from '../NumericAnnotationGlyphs';
import { NeoMove } from './NeoMove';

export function is_questionable_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_questionable_move);
}

export function is_poor_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_poor_move);
}

export function is_very_poor_move(move: NeoMove): boolean {
	return move.nags.contains(NAG_very_poor_move);
}

export function is_error_move(move: NeoMove): boolean {
	return (
		is_questionable_move(move) || is_poor_move(move) || is_very_poor_move(move)
	);
}

export function is_correct_move(move: NeoMove): boolean {
	return !is_error_move(move);
}
