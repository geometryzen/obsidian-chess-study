import { bfsGeneratorLR } from './bfsGeneratorLR';
import { exists_target_move } from './exists_target_move';
import { find_parent } from './find_parent';
import { get_target_move } from './get_target_move';
import { is_left_child_of_parent } from './is_left_child_of_parent';
import { is_right_child_of_parent } from './is_right_child_of_parent';
import { neo_clone_move_shallow } from './neo_clone_move_shallow';
import { NeoStudy } from './NeoStudy';

/**
 * Ensures that all of the moves in the source study are included in the target study.
 * This function is used to support "Flash-Card Driven Development" of a repertoire.
 */
export function ensure_target_moves(
	sourceStudy: NeoStudy,
	targetStudy: NeoStudy | null,
): void {
	if (targetStudy) {
		const source_moves = bfsGeneratorLR(sourceStudy.root);
		for (const source_move of source_moves) {
			if (exists_target_move(source_move, sourceStudy, targetStudy)) {
				// We already have the source move in the target study.
			} else {
				const target_move = neo_clone_move_shallow(source_move);
				// We do not have the source move in the target study.
				const source_move_parent = find_parent(sourceStudy.root, source_move);
				if (source_move_parent) {
					const target_move_parent = get_target_move(
						source_move_parent,
						sourceStudy,
						targetStudy,
						null,
					);
					if (target_move_parent) {
						// We must now add the move correctly to the parent.
						if (is_left_child_of_parent(source_move, source_move_parent)) {
							if (target_move_parent.left) {
								let parent = target_move_parent.left;
								while (parent.right) {
									parent = parent.right;
								}
								parent.right = target_move;
								// We must add to the rightmost variation as the right child.
							} else {
								target_move_parent.left = target_move;
							}
							// The move must be added as a next move
						} else if (is_right_child_of_parent(source_move, source_move_parent)) {
							// The move must be added as a variation
							if (target_move_parent.right) {
								let parent = target_move_parent.right;
								while (parent.right) {
									parent = parent.right;
								}
								parent.right = target_move;
							} else {
								target_move_parent.right = target_move;
							}
						} else {
							throw new Error('???');
						}
					} else {
						// target_move_parent is not defined.
						throw new Error(`foobar ${target_move?.san} ${source_move_parent.san}`);
						// We probaly should assert if this is not the root.
					}
				} else {
					// The source move has no parent so it must be the root.
					if (targetStudy.root) {
						// Let's be careful not to blow away anything
					} else {
						targetStudy.root = target_move;
					}
				}
			}
		}
	} else {
		// If there is no target study then there is nothing to do
	}
}
