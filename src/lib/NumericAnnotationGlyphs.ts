export const NAG_null = 0;
export const NAG_good_move = 1;
export const NAG_poor_move = 2;
export const NAG_very_good_move = 3;
export const NAG_very_poor_move = 4;
export const NAG_speculative_move = 5;
export const NAG_questionable_move = 6;

export type NumericAnnotationGlyph =
	| typeof NAG_null
	| typeof NAG_good_move
	| typeof NAG_poor_move
	| typeof NAG_very_good_move
	| typeof NAG_very_poor_move
	| typeof NAG_speculative_move
	| typeof NAG_questionable_move;

export function nag_to_string(nag: NumericAnnotationGlyph): string {
	switch (nag) {
		case NAG_null:
			return '';
		case NAG_good_move:
			return '!';
		case NAG_poor_move:
			return '?';
		case NAG_very_good_move:
			return '!!';
		case NAG_very_poor_move:
			return '??';
		case NAG_speculative_move:
			return '!?';
		case NAG_questionable_move:
			return '?!';
		default: {
			return `${nag}`;
		}
	}
}

export function nags_to_string(nags: NumericAnnotationGlyph[]): string {
	return nags.map(nag_to_string).join(' ');
}
