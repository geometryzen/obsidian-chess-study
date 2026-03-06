/**
 *
 */
export interface MoveIndex {
	/**
	 * If this property is null, then the index corresponds to the moves array in the chess study (Main Line).
	 * Otherwise, this property identifies the Main Line move index and the index of the variation.
	 */
	indexLocation: { mainLineMoveIndex: number; variationIndex: number } | null;
	/**
	 * The array index, where the array is specified by the property above.
	 */
	moveIndex: number;
}
