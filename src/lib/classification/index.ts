/**
 * chess.com-style move classifications, set by hand.
 *
 * What a label is called, how it is drawn, which key sets it and which glyph it
 * imports from all live in one table, so a new label is one row.
 */

import {
	NAG_excellent_move,
	NAG_good_move,
	NAG_poor_move,
	NAG_questionable_move,
	NAG_speculative_move,
	NAG_very_poor_move,
} from '../NumericAnnotationGlyphs';

export type MoveAnnotation =
	'bangbang' | 'bang' | 'bangqmark' | 'qmarkbang' | 'qmark' | 'qmarkqmark';

interface MoveAnnotationInfo {
	label: string;
	glyph: string;
	color: string;
	/** Digit that applies this label when the widget has focus. */
	shortcut: string;
	/**
	 * Numeric Annotation Glyph: what the PGN importer reads this label from, and
	 * what an exporter would write. Tiers with no standard glyph are null.
	 */
	nag: number | null;
}

export const moveAnnotationMap: Record<MoveAnnotation, MoveAnnotationInfo> = {
	bangbang: {
		label: 'Brilliant',
		glyph: '!!',
		color: '#26c2a3',
		shortcut: '1',
		nag: NAG_excellent_move,
	},
	bang: {
		label: 'Great',
		glyph: '!',
		color: '#5c8bb0',
		shortcut: '2',
		nag: NAG_good_move,
	},
	bangqmark: {
		label: 'Interesting',
		glyph: '!?',
		color: '#96af8b',
		shortcut: '5',
		nag: NAG_speculative_move,
	},
	/*
	excellent: {
		label: 'Excellent',
		glyph: '★',
		color: '#96bc4b',
		shortcut: '3',
		nag: null,
	},
	*/
	/*
	good: {
		label: 'Good',
		glyph: '✓',
		color: '#96af8b',
		shortcut: '4',
		nag: null,
	},
	*/
	qmarkbang: {
		label: 'Inaccuracy',
		glyph: '?!',
		color: '#f7c631',
		shortcut: '5',
		nag: NAG_questionable_move,
	},
	qmark: {
		label: 'Mistake',
		glyph: '?',
		color: '#ffa459',
		shortcut: '6',
		nag: NAG_poor_move,
	},
	qmarkqmark: {
		label: 'Blunder',
		glyph: '??',
		color: '#fa412d',
		shortcut: '7',
		nag: NAG_very_poor_move,
	},
};

export const CLASSIFICATION_ORDER = Object.keys(
	moveAnnotationMap,
) as MoveAnnotation[];

/**
 * The mark on a move that leaves the game drawn.
 *
 * Not a classification, so it is not in the table above: nobody sets it and
 * nobody can clear it - the position says so - which is why it has no shortcut
 * and no NAG. It only borrows the same visual parts, so it reads as a sibling of
 * the labels it sits beside. The colour is deliberately neutral: a draw is the
 * one verdict that favours neither side.
 */
export const DRAW_MARK = {
	label: 'This position is a draw',
	glyph: '½',
	color: '#8f9bb3',
};

const BY_SHORTCUT = new Map(
	CLASSIFICATION_ORDER.map((key) => [moveAnnotationMap[key].shortcut, key]),
);

/** `1`-`7` pick a label; `0` clears one. Anything else is not a shortcut. */
export const classificationForKey = (
	key: string,
): { classification: MoveAnnotation | null } | null => {
	if (key === '0') return { classification: null };

	const classification = BY_SHORTCUT.get(key);

	return classification ? { classification } : null;
};

const isClassification = (value: unknown): value is MoveAnnotation =>
	typeof value === 'string' && value in moveAnnotationMap;

/** Guards against a hand-edited or future-version repertoire file. */
export const readClassification = (value: unknown): MoveAnnotation | null =>
	isClassification(value) ? value : null;

/**
 * Badge drawn on the destination square of the move it belongs to.
 *
 * Chessground hands custom SVGs a 100x100 coordinate system anchored at the
 * top-left of the square. The badge is kept fully inside that box rather than
 * overhanging the corner as chess.com's does: the board wrapper clips its
 * overflow to keep its rounded corners, so an overhanging badge is sliced in
 * half on the h-file and the 8th rank.
 */
export const badgeSvg = (
	glyph: string,
	color: string,
): { html: string; center?: 'orig' | 'dest' | 'label' } => {
	// Two-character glyphs need to be set smaller to stay inside the circle.
	const fontSize = glyph.length > 1 ? 26 : 32;

	return {
		html: `
		<circle cx="76" cy="24" r="21" fill="${color}" stroke="#ffffff" stroke-width="4" />
		<text x="76" y="24" fill="#ffffff" font-size="${fontSize}" font-weight="700"
		      font-family="Inter, system-ui, sans-serif"
		      text-anchor="middle" dominant-baseline="central">${glyph}</text>
	`,
	};
};
