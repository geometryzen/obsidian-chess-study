import { parse, ParseTree } from '@mliebelt/pgn-parser';
import { GameComment, PgnMove, Tags } from '@mliebelt/pgn-types';
import Document from '@tiptap/extension-document'; // Import necessary extensions
import {
	default as Bold,
	default as Paragraph,
} from '@tiptap/extension-paragraph'; // Import necessary extensions
import Text from '@tiptap/extension-text'; // Import necessary extensions
import { generateJSON, JSONContent } from '@tiptap/react';
import { Chess, PieceSymbol, QUEEN, Square, SQUARES } from 'chess.js';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { nanoid } from 'nanoid';
import { ROOT_FEN } from 'src/main';
import { getChessDataFormat } from '../fen-or-pgn';
import {
	ChessStudyFileContent,
	ChessStudyMove,
	CURRENT_STORAGE_VERSION,
} from '../storage';
import { turnColor } from './turnColor';

/**
 * Gets the set of legal moves for the current position.
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function legalMoves(chess: Chess): Map<Square, Square[]> {
	const dests = new Map();
	SQUARES.forEach((s) => {
		const ms = chess.moves({ square: s, verbose: true });
		if (ms.length)
			dests.set(
				s,
				ms.map((m) => m.to),
			);
	});
	return dests;
}

/**
 * Returns a function that updates the chess model and view based on the move
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function playOtherSide(view: Api, chess: Chess) {
	return (from: string, to: string) => {
		const move = chess.move({ from, to, promotion: QUEEN });

		const viewConfig: Partial<Config> = {
			// I'm not sure what thi does! You can comment it out and not much changes.
			// turnColor: turnColor(chess),
			movable: {
				// Only allow moves by whoevers turn it is.
				color: turnColor(chess),
				// Only allow legal moves.
				dests: legalMoves(chess),
			},
			// this highlights the checked king in red.
			check: chess.isCheck(),
		};

		if (move.isEnPassant() || move.promotion) {
			// Handle En Passant && Promote to Queen by default
			view.set({
				fen: chess.fen(),
				...viewConfig,
			});
		} else {
			view.set(viewConfig);
		}

		return move;
	};
}

/**
 * Convert chess.js to our proprietary format.
 * We will use this after parsing a FEN only in future.
 * The idea is to parse a PGN using a different parser than chess.js
 * This should make it easier to handle advanced PGN features.
 */
function chess_to_study(
	chess: Chess,
	format: 'FEN' | 'PGN',
	chessStringOrStartPos: string,
): ChessStudyFileContent {
	const findComment = (fen: string): JSONContent | null => {
		const comments = chess.getComments();
		for (let i = 0; i < comments.length; i++) {
			const c = comments[i];
			if (c.fen == fen) {
				const jsonContent = generateJSON(c.comment as string, [
					Document,
					Paragraph,
					Text,
					Bold,
					// ... other extensions used in the HTML
				]);
				return jsonContent;
			}
		}
		return null;
	};

	const gameComment = (): JSONContent | null => {
		const cs = findComment(ROOT_FEN);
		if (Array.isArray(cs)) {
			if (cs.length > 0) {
				return cs[0];
			}
		}
		return null;
	};

	const fileContent: ChessStudyFileContent = {
		version: CURRENT_STORAGE_VERSION,
		headers: chess.getHeaders(),
		comment: gameComment(), // seems to return the last comment
		moves: chess.history({ verbose: true }).map((move) => ({
			moveId: nanoid(),
			variants: [],
			shapes: [],
			comment: findComment(move.after),
			color: move.color,
			san: move.san,
			after: move.after,
			from: move.from,
			to: move.to,
			promotion: move.promotion,
		})),
		rootFEN: format === 'FEN' ? chessStringOrStartPos : ROOT_FEN,
	};
	return fileContent;
}
/*
function parse_pgn_to_chess(chessStringTrimmed: string): Chess {
	const chess = new Chess();

	// We are using chess.js to do our PGN parsing.
	chess.loadPgn(chessStringTrimmed, {
		strict: false,
	});
	return chess;
}
*/
/*
function legacy_compile_pgn(chessStringTrimmed: string): ChessStudyFileContent {
	const chess = parse_pgn_to_chess(chessStringTrimmed);
	return chess_to_study(chess, 'PGN', chessStringTrimmed);
}
*/

function tags_to_headers(tags: Tags | undefined): Record<string, string> {
	const headers: Record<string, string> = {};
	if (tags) {
		// A difficulty with the tags design is that some fields
		// are not simply strings. As a result we must be careful when
		// mapping them over.
		headers['Event'] = tags.Event;
		headers['Site'] = tags.Site;
		if (tags.Date && tags.Date.value) {
			headers['Date'] = tags.Date.value;
		} else {
			headers['Date'] = '????.??.??';
		}
		headers['Round'] = tags.Round;
		headers['White'] = tags.White;
		headers['Black'] = tags.Black;
		headers['Result'] = tags.Result;
		if (tags.ECO) {
			headers['ECO'] = tags.ECO;
		}
		if (tags.WhiteElo) {
			headers['WhiteElo'] = tags.WhiteElo;
		}
		if (tags.BlackElo) {
			headers['BlackElo'] = tags.BlackElo;
		}
		if (tags.PlyCount) {
			headers['PlyCount'] = tags.PlyCount;
		}
		if (tags.EventDate && tags.EventDate.value) {
			headers['EventDate'] = tags.EventDate.value;
		}
		// The following are used by Lichess
		// GameId
		if (tags.UTCDate && tags.UTCDate.value) {
			headers['UTCDate'] = tags.UTCDate.value;
		}
		if (tags.UTCTime && tags.UTCTime.value) {
			headers['UTCTime'] = tags.UTCTime.value;
		}
		if (tags.WhiteRatingDiff) {
			headers['WhiteRatingDiff'] = tags.WhiteRatingDiff;
		}
		if (tags.BlackRatingDiff) {
			headers['BlackRatingDiff'] = tags.BlackRatingDiff;
		}
		if (tags.Variant) {
			headers['Variant'] = tags.Variant;
		}
		if (tags.TimeControl && tags.TimeControl.value) {
			headers['TimeControl'] = tags.TimeControl.value;
		}
		if (tags.Opening) {
			headers['Opening'] = tags.Opening;
		}
		if (tags.Termination) {
			headers['Termination'] = tags.Termination;
		}
		if (tags.Annotator) {
			headers['Annotator'] = tags.Annotator;
		}
	}
	return headers;
}
function string_to_json_comment(
	comment: string | undefined,
): JSONContent | null {
	if (comment) {
		const jsonContent: JSONContent = generateJSON(comment, [
			Document,
			Paragraph,
			Text,
			Bold,
			// ... other extensions used in the HTML
		]);
		return jsonContent;
	} else {
		return null;
	}
}

function game_comment_to_json_comment(
	gameComment: GameComment | undefined,
): JSONContent | null {
	if (gameComment) {
		if (gameComment.comment) {
			return string_to_json_comment(gameComment.comment);
		} else {
			return null;
		}
	} else {
		return null;
	}
}

function pgn_moves_to_chess_study_moves(gms: PgnMove[]): ChessStudyMove[] {
	// We use chess.js to compute the after, from, and to properties.
	const chess = new Chess(ROOT_FEN);
	const moves: ChessStudyMove[] = [];
	for (let i = 0; i < gms.length; i++) {
		const m = gms[i];
		// This may need some work for promotions?
		chess.move(m.notation.notation);
		const history = chess.history({ verbose: true });
		const chessMove = history[history.length - 1];
		m.nag;
		m.variations;
		m.commentDiag;
		m.drawOffer;
		m.commentMove;
		const move: ChessStudyMove = {
			moveId: nanoid(),
			variants: [],
			shapes: [],
			comment: string_to_json_comment(m.commentAfter),
			color: m.turn,
			san: m.notation.notation,
			after: chessMove.after,
			from: chessMove.from,
			to: chessMove.to,
			promotion: m.notation.promotion as PieceSymbol, // There may be an issue here.
		};
		moves.push(move);
	}
	return moves;
}

function modern_compile_pgn(chessStringTrimmed: string): ChessStudyFileContent {
	const game = parse(chessStringTrimmed, { startRule: 'game' }) as ParseTree;
	// console.lg(JSON.stringify(game, null, 2));
	// The messages contain statements about the parsing.
	game.messages;
	const fileContent: ChessStudyFileContent = {
		version: CURRENT_STORAGE_VERSION,
		headers: tags_to_headers(game.tags),
		comment: game_comment_to_json_comment(game.gameComment),
		moves: pgn_moves_to_chess_study_moves(game.moves),
		// TODO: This does not long correct for the case of starting from a non-root position.
		rootFEN: ROOT_FEN,
	};
	// console.lg(JSON.stringify(fileContent, null, 2));
	return fileContent;
}

export function compile_pgn_or_fen(
	chessStringTrimmed: string,
): ChessStudyFileContent {
	const format = getChessDataFormat(chessStringTrimmed);
	switch (format) {
		case 'FEN': {
			const chess = new Chess(chessStringTrimmed);
			return chess_to_study(chess, 'FEN', chessStringTrimmed);
		}
		case 'PGN': {
			return modern_compile_pgn(chessStringTrimmed);
			// return legacy_compile_pgn(chessStringTrimmed);
		}
		default: {
			throw new Error('Chess string must be FEN or PGN.');
		}
	}
}
