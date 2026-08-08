export class NeoMove {
	/**
	 * The position in FEN notation after this move was made.
	 */
	readonly after: string;
	/**
	 * The time on the clock after this move was made.
	 */
	readonly clock: string | undefined;
	/**
	 * The color of the piece that was moved.
	 */
	readonly color: 'w' | 'b';
	/**
	 * The comment after this move was made.
	 */
	comment: unknown | null;
	/**
	 * The evaluation of the position after this move has been made.
	 */
	readonly evaluation: number | undefined;
	/**
	 * The departure square of the move.
	 */
	readonly from: string;
	/**
	 * A unique identifier for the move.
	 */
	readonly moveId: string;
	/**
	 * The Numeric Annotation Glyphs.
	 */
	nags: number[];
	/**
	 * The promotion choice for this move.
	 */
	readonly promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined;
	/**
	 * The Standard Algebraic Notation for this move.
	 */
	readonly san: string;
	/**
	 * The shapes that should be drawn after this move has been made.
	 */
	shapes: unknown[];
	/**
	 * The desination square of this move.
	 */
	readonly to: string;
	/**
	 * The left leg of the tree is the next move.
	 */
	left: NeoMove | null;
	/**
	 * The right leg of the tree is the next variation.
	 */
	right: NeoMove | null;
	constructor(
		/**
		 * The position in FEN notation after this move was made.
		 */
		after: string,
		/**
		 * The time on the clock after this move was made.
		 */
		clock: string | undefined,
		/**
		 * The color of the piece that was moved.
		 */
		color: 'w' | 'b',
		/**
		 * The comment after this move was made.
		 */
		comment: unknown | null,
		/**
		 * The evaluation of the position after this move has been made.
		 */
		evaluation: number | undefined,
		/**
		 * The departure square of the move.
		 */
		from: string,
		/**
		 * A unique identifier for the move.
		 */
		id: string,
		/**
		 * The Numeric Annotation Glyphs.
		 */
		nags: number[],
		/**
		 * The promotion choice for this move.
		 */
		promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined,
		/**
		 * The Standard Algebraic Notation for this move.
		 */
		san: string,
		/**
		 * The shapes that should be drawn after this move has been made.
		 */
		shapes: unknown[],
		/**
		 * The desination square of this move.
		 */
		to: string,
		/**
		 * The move that follows this move.
		 */
		left: NeoMove | null,
		/**
		 * A variation or alternative to this move.
		 */
		right: NeoMove | null,
	) {
		this.after = after;
		this.clock = clock;
		this.color = color;
		this.comment = comment;
		this.evaluation = evaluation;
		this.from = from;
		this.moveId = id;
		this.nags = nags;
		this.promotion = promotion;
		this.san = san;
		this.shapes = shapes;
		this.to = to;
		this.left = left;
		this.right = right;
	}
}
