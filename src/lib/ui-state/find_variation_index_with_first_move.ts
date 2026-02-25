import { ChessStudyFileVariation } from '../store/ChessStudyFileMove';
import { is_first_move_in_variation } from './is_first_move_in_variation';

/**
 * Returns the index of the variation where the first move matches the provided standard annotation
 * @param variations
 * @param san
 * @returns
 */
export function find_variation_index_with_first_move(
	variations: ChessStudyFileVariation[],
	san: string,
): number {
	for (let i = 0; i < variations.length; i++) {
		const variation = variations[i];
		if (is_first_move_in_variation(variation, san)) {
			return i;
		}
	}
	return -1;
}
