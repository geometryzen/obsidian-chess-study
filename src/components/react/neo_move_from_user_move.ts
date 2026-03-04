import { JSONContent } from '@tiptap/react';
import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { NumericAnnotationGlyph } from '../../lib/NumericAnnotationGlyphs';
import { NeoMove } from '../../lib/tree/NeoMove';

export function neo_move_from_user_move(
	m: Move,
	left: NeoMove | null,
	right: NeoMove | null,
): NeoMove {
	const clock: string | undefined = void 0;
	const comment: JSONContent | null = null;
	const evaluation: number | undefined = void 0;
	const nags: NumericAnnotationGlyph[] = [];
	const shapes: DrawShape[] = [];
	return new NeoMove(
		m.after,
		clock,
		m.color,
		comment,
		evaluation,
		m.from,
		nanoid(),
		nags,
		m.promotion,
		m.san,
		shapes,
		m.to,
		left,
		right,
	);
}
