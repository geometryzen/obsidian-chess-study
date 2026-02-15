import { Chess, Move } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { DrawShape } from 'chessground/draw';
import { Key, MoveMetadata } from 'chessground/types';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { playOtherSide, legalMoves } from '../../lib/chess-logic';
import { turnColor } from '../../lib/chess-logic/turnColor';

/**
 * Strictly speaking, these are the React properties of our Chessground wrapper.
 */
export interface ChessgroundProps {
	api: Api | null;
	setApi: React.Dispatch<React.SetStateAction<Api>>;
	chess: Chess;
	onMove: (move: Move) => void;
	syncShapes: (shapes: DrawShape[]) => void;
	isViewOnly: boolean;
	shapes: DrawShape[];
	config?: Config;
	boardColor?: 'brown' | 'green';
}

export const ChessgroundWrapper = React.memo(
	({
		api,
		setApi,
		chess,
		onMove,
		syncShapes: setShapes,
		isViewOnly,
		shapes,
		boardColor = 'green',
		config = {},
	}: ChessgroundProps) => {
		const ref = useRef<HTMLDivElement>(null);

		// Chessground Inititialization
		useEffect(() => {
			if (ref.current && !api) {
				const board = Chessground(ref.current, {
					fen: chess.fen(),
					animation: { enabled: true, duration: 200 },
					check: chess.isCheck(),
					// coordinates: true,
					// coordinatesOnSquares: false,
					// disableContextMenu: true,
					movable: {
						free: false,
						color: turnColor(chess),
						dests: legalMoves(chess),
					},
					highlight: {
						check: true,
						lastMove: true,
					},
					drawable: {
						onChange: (shapes) => {
							setShapes(shapes);
						},
					},
					turnColor: turnColor(chess),
					...config,
				});
				setApi(board);
			} else if (ref.current && api) {
				api.set(config);
			}
		}, [onMove, api, chess, config, setApi, setShapes]);

		// Sync Chess Logic
		useEffect(() => {
			api?.set({
				movable: {
					events: {
						// Hook up the Chessground UI changes to our App State
						after: (orig: Key, dest: Key, _metadata: MoveMetadata) => {
							const handler = playOtherSide(api, chess);
							// This name assumes a particulat usage
							const move: Move = handler(orig, dest);
							onMove(move);
						},
					},
				},
			});
		}, [onMove, api, chess]);

		// Sync View Only
		useEffect(() => {
			api?.set({ viewOnly: isViewOnly });
		}, [isViewOnly, api]);

		// Load Shapes
		useEffect(() => {
			if (shapes) {
				api?.setShapes([...shapes]);
			}
		}, [api, shapes]);

		return (
			<div className={`${boardColor}-board height-width-100 table`}>
				<div ref={ref} className={`height-width-100`} />
			</div>
		);
	},
);

ChessgroundWrapper.displayName = 'ChessgroundWrapper';
