import * as React from 'react';
import { useMemo } from 'react';
import { dfsGeneratorRL } from '../../lib/neo/dfsGeneratorRL';
import { find_parent } from '../../lib/neo/find_parent';
import { NeoMove } from '../../lib/neo/NeoMove';
import { Controls } from './Controls';
import { MoveItem } from './MoveItem';
import { NeoMovesViewerProps } from './NeoMovesViewerProps';
// import { get_move_next } from '../../lib/neo/get_move_next';
import { get_variation_next } from '../../lib/neo/get_variation_next';
import { get_move_next } from '../../lib/neo/get_move_next';

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
	const rows_and_data = useMemo(() => {
		const data: { [id: string]: number } = {};
		if (study.root) {
			data[study.root.moveId] = initialMoveNumber;
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
						if (get_move_next(white) === node) {
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
			const parent = find_parent(study.root, node);
			if (parent) {
				const parentIndex: number = data[parent.moveId];
				if (get_variation_next(parent) === node) {
					data[node.moveId] = parentIndex;
				} else {
					data[node.moveId] = node.color === 'w' ? parentIndex + 1 : parentIndex;
				}
			}
		}
		return { data, rows };
	}, [initialMoveNumber, study.root]);
	return (
		<div className="height-width-100">
			{isVisible && (
				<div className="move-item-section">
					<div className="move-item-container">
						{rows_and_data.rows.map(({ key, white, black }, index) => {
							return (
								<React.Fragment key={key}>
									<p className="move-indicator center">
										{`${rows_and_data.data[white ? white.moveId : black ? black.moveId : 0]}`}
									</p>
									<MoveItem
										san={white ? white.san : '...'}
										nags={white ? white.nags : []}
										isCurrentMove={white ? white.moveId === currentMoveId : false}
										onMoveItemClick={
											white ? () => onMoveItemClick(white.moveId) : () => {}
										}
									/>
									<MoveItem
										san={black ? black.san : '...'}
										nags={black ? black.nags : []}
										isCurrentMove={black ? black.moveId === currentMoveId : false}
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
