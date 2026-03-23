import * as React from 'react';
import { useMemo } from 'react';
import { dfsGeneratorRL } from '../../lib/neo/dfsGeneratorRL';
import { find_parent } from '../../lib/neo/find_parent';
import { get_next_move } from '../../lib/neo/get_next_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_variation_depth } from '../../lib/neo/get_variation_depth';
import { get_variation_next } from '../../lib/neo/get_variation_next';
import { is_main_line, is_prior_move } from '../../lib/neo/is_parent';
import { NeoMove } from '../../lib/neo/NeoMove';
import { Controls } from './Controls';
import { MoveIndicator } from './MoveIndicator';
import { MoveItem } from './MoveItem';
import { NeoMovesViewerProps } from './NeoMovesViewerProps';

export const NeoMovesViewer = React.memo((props: NeoMovesViewerProps) => {
	const {
		study,
		// neoMoves,
		currentMoveId,
		// initialPlayer,
		initialMoveNumber,
		isVisible,
		onMoveItemClick,
		...controlActions
	} = props;

	// The idea here is to compute a data structure that is easier for the UI to build.
	// We might even test this mapping in automated tests.
	// I strongly suspect that the UI is not updating because of the way that useMemo checks for changes in dependencies.
	// If I mutate a part or the tree that is lower than the root then the root itself does no change.
	// The problem is not really useMemo but the mutation of the tree.
	// I think useImmerReducer may be problematic.
	const { data, rows } = useMemo(() => {
		// console.lg('useMemo called.');
		const currentMove = currentMoveId
			? get_neo_move_by_id(study, currentMoveId)
			: null;
		const data: {
			[id: string]: {
				moveNumber: number;
				ancestor: boolean;
				mainline: boolean;
				depth: number;
			};
		} = {};
		if (study.root) {
			data[study.root.moveId] = {
				moveNumber: initialMoveNumber,
				ancestor: is_prior_move(study.root, study.root, currentMove),
				mainline: is_main_line(study.root, currentMove),
				depth: get_variation_depth(study.root, study.root),
			};
		}
		const nodes = dfsGeneratorRL(study.root);
		const rows: { key: string; white: NeoMove | null; black: NeoMove | null }[] =
			[];
		for (const node of nodes) {
			if (node.color === 'w') {
				rows.push({ key: node.moveId, white: node, black: null });
			} else {
				if (rows.length > 0) {
					const previous_row = rows[rows.length - 1];
					if (previous_row.white) {
						const white = previous_row.white;
						if (get_next_move(white) === node) {
							previous_row.black = node;
						} else {
							rows.push({ key: node.moveId, white: null, black: node });
						}
					} else {
						rows.push({ key: node.moveId, white: null, black: node });
					}
				} else {
					rows.push({ key: node.moveId, white: null, black: node });
				}
			}
			const ancestor = is_prior_move(study.root, node, currentMove);
			const mainline = is_main_line(node, currentMove);
			const depth = get_variation_depth(study.root, node);
			const parent = find_parent(study.root, node);
			if (parent) {
				const parent_move_number: number = data[parent.moveId].moveNumber;
				if (get_variation_next(parent) === node) {
					data[node.moveId] = {
						moveNumber: parent_move_number,
						ancestor,
						mainline,
						depth,
					};
				} else {
					data[node.moveId] =
						node.color === 'w'
							? { moveNumber: parent_move_number + 1, ancestor, mainline, depth }
							: { moveNumber: parent_move_number, ancestor, mainline, depth };
				}
			}
		}
		return { data, rows };
	}, [study, initialMoveNumber, currentMoveId]);
	return (
		<div className="height-width-100">
			{isVisible && (
				<div className="move-item-section">
					<div className="move-item-container">
						{rows.map(({ key, white, black }, index) => {
							return (
								<React.Fragment key={key}>
									<MoveIndicator
										moveNumber={
											data[white ? white.moveId : (black as NeoMove).moveId].moveNumber
										}
										onMoveIndexClick={() => {
											// TODO
										}}
									/>
									<MoveItem
										san={white ? white.san : '...'}
										nags={white ? white.nags : []}
										isCurrentMove={white ? white.moveId === currentMoveId : false}
										ancestor={white ? data[white.moveId].ancestor : false}
										mainline={white ? data[white.moveId].mainline : false}
										depth={white ? data[white.moveId].depth : 0}
										onMoveItemClick={
											white ? () => onMoveItemClick(white.moveId) : () => {}
										}
									/>
									<MoveItem
										san={black ? black.san : '...'}
										nags={black ? black.nags : []}
										isCurrentMove={black ? black.moveId === currentMoveId : false}
										ancestor={black ? data[black.moveId].ancestor : false}
										mainline={black ? data[black.moveId].mainline : false}
										depth={black ? data[black.moveId].depth : 0}
										onMoveItemClick={
											black ? () => onMoveItemClick(black.moveId) : () => {}
										}
									/>
								</React.Fragment>
							);
						})}
					</div>
				</div>
			)}
			<Controls currentMoveId={props.currentMoveId} {...controlActions} />
		</div>
	);
});

NeoMovesViewer.displayName = 'NeoMovesViewer';
