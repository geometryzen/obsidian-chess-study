import * as React from 'react';
import { useMemo } from 'react';
import { dfsGeneratorRL } from '../../lib/neo/dfsGeneratorRL';
import { NeoMove } from '../../lib/neo/NeoMove';
import { Controls } from './Controls';
import { MoveItem } from './MoveItem';
import { NeoMovesViewerProps } from './NeoMovesViewerProps';
import { find_parent } from '../../lib/neo/find_parent';
// import { get_move_next } from '../../lib/neo/get_move_next';
import { get_variation_next } from '../../lib/neo/get_variation_next';

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
	const moves_and_data = useMemo(() => {
		const data: { [id: string]: number } = {};
		if (study.root) {
			data[study.root.moveId] = initialMoveNumber;
		}
		const nodes = dfsGeneratorRL(study.root);
		const moves: NeoMove[] = [];
		for (const node of nodes) {
			moves.push(node);
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
		return { data, moves };
	}, [initialMoveNumber, study.root]);
	/*
	const data: { [id: string]: number } = {};
	if (study.root) {
		data[study.root.moveId] = initialMoveNumber;
	}
	const nodes = dfsGeneratorRL(study.root);
	const moves: NeoMove[] = [];
	for (const node of nodes) {
		moves.push(node);
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
	const moves_and_data = { moves, data };
	*/
	return (
		<div className="height-width-100">
			{isVisible && (
				<div className="move-item-section">
					<div className="move-item-container">
						{moves_and_data.moves.map((move, index) => {
							return (
								<React.Fragment key={move.moveId}>
									<p className="move-indicator center">
										{`${moves_and_data.data[move.moveId]}`}
									</p>
									<MoveItem
										san={move.color === 'w' ? move.san : '...'}
										nags={move.color === 'w' ? move.nags : []}
										isCurrentMove={
											move.color === 'w' ? move.moveId === currentMoveId : false
										}
										onMoveItemClick={
											move.color === 'w' ? () => onMoveItemClick(move.moveId) : () => {}
										}
									/>
									<MoveItem
										san={move.color === 'b' ? move.san : '...'}
										nags={move.color === 'b' ? move.nags : []}
										isCurrentMove={
											move.color === 'b' ? move.moveId === currentMoveId : false
										}
										onMoveItemClick={
											move.color === 'b' ? () => onMoveItemClick(move.moveId) : () => {}
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
