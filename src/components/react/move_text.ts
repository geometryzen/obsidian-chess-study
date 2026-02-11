import {
	nags_to_string,
	NumericAnnotationGlyph,
} from '../../lib/NumericAnnotationGlyphs';

export function move_text(san: string, nags: NumericAnnotationGlyph[]): string {
	if (Array.isArray(nags) && nags.length > 0) {
		return `${san} ${nags_to_string(nags)}`;
	} else {
		return san;
	}
}
