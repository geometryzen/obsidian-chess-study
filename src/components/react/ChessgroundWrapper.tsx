import { Chess, Move } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { DrawShape } from 'chessground/draw';
import { Key, MoveMetadata } from 'chessground/types';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { legal_moves } from '../../lib/chess-logic/legal_moves.js';
import { make_move_handler } from '../../lib/chess-logic/make_move_handler.js';
import { turn_color_white_or_black } from '../../lib/chess-logic/turn_color_white_or_black.js';
import { BoardColor } from '../../settings.js';

/**
 * Strictly speaking, these are the React properties of our Chessground wrapper.
 */
export interface ChessgroundProps {
	api: Api | null;
	setApi: React.Dispatch<React.SetStateAction<Api>>;
	chess: Chess;
	onMove: (move: Move) => void;
	syncShapes: (shapes: DrawShape[]) => void;
	canDraw: boolean;
	savesShapes: boolean;
	isViewOnly: boolean;
	shapes: DrawShape[];
	autoShapes?: DrawShape[];
	config?: Config;
	boardColor?: BoardColor;
}

export const ChessgroundWrapper = React.memo(
	({
		api,
		setApi,
		chess,
		onMove,
		syncShapes: setShapes,
		canDraw,
		savesShapes,
		isViewOnly,
		shapes,
		autoShapes,
		boardColor = 'brown',
		config = {},
	}: ChessgroundProps) => {
		const ref = useRef<HTMLDivElement>(null);

		// TODO: Promotion

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
						color: turn_color_white_or_black(chess),
						dests: legal_moves(chess),
					},
					highlight: {
						check: true,
						lastMove: true,
					},
					drawable: {
						onChange: (shapes: DrawShape[]) => {
							setShapes(shapes);
						},
					},
					turnColor: turn_color_white_or_black(chess),
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
							const handler = make_move_handler(api, chess);
							// This name assumes a particular usage.
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

		//
		useEffect(() => {
			api?.set({ drawable: { enabled: canDraw } });
		}, [api, canDraw]);

		// Load Shapes
		useEffect(() => {
			if (shapes) {
				api?.setShapes([...shapes]);
			}
		}, [api, shapes]);

		// Plugin-owned decorations, kept apart from the user's own shapes.
		useEffect(() => {
			console.log('autoShapes', JSON.stringify(autoShapes));
			try {
				api?.setAutoShapes([...(autoShapes ?? [])]);
			} catch (e) {
				console.warn(`setAutoShapes Cause: ${e}`);
			}
		}, [api, autoShapes]);

		// TODO: Promotion stuff.

		return (
			//  height-width-100 table (removed)
			<div className={`cs-board ${boardColor}-board`}>
				<div ref={ref} className={`height-width-100`} />
			</div>
		);
	},
);

ChessgroundWrapper.displayName = 'ChessgroundWrapper';
