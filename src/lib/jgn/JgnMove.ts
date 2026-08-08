/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface JgnVariation {
	/**
	 * The identifier of the Main Line move corresponding to this variation.
	 * This is not the prior move.
	 * It is the move containing this Variation in its variations list.
	 * It would be better if thisa was called the ownerMoveId?
	 */
	parentMoveId: string;
	moves: JgnMove[];
}

/**
 * This interface is part of the serialization structure and should not be changed.
 * FIXME: Extending Move couples to chess.js
 */
export interface JgnMove {
	moveId: string;
	variants: JgnVariation[];
	shapes: unknown[];
	comment: unknown | null;
	color: 'w' | 'b';
	san: string;
	after: string;
	from: string;
	to: string;
	promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined;
	/**
	 * Numeric Annotation Glyphs
	 */
	nags: number[];
	/**
	 *
	 */
	clock?: string;
	/**
	 *
	 */
	evaluation?: number;
}
