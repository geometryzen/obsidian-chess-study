import { Move } from 'chess.js';
import { nanoid } from 'nanoid';
import { NeoMove } from '../../lib/neo/NeoMove';
import { JSONContent } from '@tiptap/react';
import { DrawShape } from 'chessground/draw';

export function move_from_user_move(
	m: Move,
	left: NeoMove | null,
	right: NeoMove | null,
): NeoMove {
	const clock: string | undefined = void 0;
	const comment: JSONContent | null = null;
	const evaluation: number | undefined = void 0;
	const nags: number[] = [];
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
