import { generateText } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Chess } from 'chess.js';
import {
	nags_to_dollars,
	NumericAnnotationGlyph,
} from '../NumericAnnotationGlyphs';
import { JgnMove, JgnVariation } from './JgnMove';
import { JgnStudy } from './JgnStudy';

/**
 * The keys of the Seven Tags Roster in the canonical ordering.
 */
const seven_tag_keys = [
	'Event',
	'Site',
	'Date',
	'Round',
	'White',
	'Black',
	'Result',
];

function move_san_and_nags_to_pgn_string(
	san: string,
	nags: NumericAnnotationGlyph[],
): string {
	if (Array.isArray(nags)) {
		if (nags.length > 0) {
			return `${san} ${nags_to_dollars(nags)}`;
		} else {
			return san;
		}
	} else {
		return san;
	}
}

const seven_tag_defaults = ['?', '?', '????.??.??', '?', '?', '?', '*'];

/**
 * commands are properties of the move that will be encoded as comments with the [%key value] syntax.
 */
function commands_from_move(move: JgnMove): [key: string, value: string][] {
	const commands: [string, string][] = [];
	if (typeof move.evaluation === 'number') {
		commands.push(['eval', move.evaluation.toString()]);
	}
	if (typeof move.clock === 'string') {
		commands.push(['clk', move.clock]);
	}
	return commands;
}

/**
 * computes the comment string corresponding to a list of commands.
 */
function comment_from_commands(
	commands: [key: string, value: string][],
): string {
	const blocks = commands
		.map(([key, value]) => {
			return `[%${key} ${value}]`;
		})
		.join(' ');
	return `{ ${blocks} }`;
}

/**
 * appends the text comment for the move to the base string
 */
function append_text_comments(base: string, move: JgnMove): string {
	if (move.comment) {
		try {
			const text = generateText(move.comment, [StarterKit]);
			return `${base} { ${text} }`;
		} catch (e) {
			console.warn(e);
			console.warn(JSON.stringify(move.comment, null, 2));
			return base;
		}
	} else {
		return base;
	}
}

/**
 * appends the commands comment to the base string.
 */
function append_commands(base: string, move: JgnMove): string {
	const commands = commands_from_move(move);
	if (commands.length > 0) {
		return `${base} ${comment_from_commands(commands)}`;
	} else {
		return base;
	}
}

function append_variations(
	base: string,
	move: JgnMove,
	indexOffset: number,
	rootMoveNumber: number,
): string {
	if (Array.isArray(move.variants)) {
		if (move.variants.length > 0) {
			return `${base} ${move.variants
				.map((variation: JgnVariation) => {
					return `(${moves_to_string(variation.moves, indexOffset, rootMoveNumber)})`;
				})
				.join(' ')}`;
		} else {
			return base;
		}
	} else {
		return base;
	}
}

function moves_to_string(
	moves: JgnMove[],
	indexOffset: number,
	rootMoveNumber: number,
): string {
	return moves
		.map((move, index) => {
			switch (move.color) {
				case 'w': {
					const num_san_nags_white = `${(index + indexOffset) / 2 + rootMoveNumber}. ${move_san_and_nags_to_pgn_string(move.san, move.nags)}`;
					return append_variations(
						append_commands(append_text_comments(num_san_nags_white, move), move),
						move,
						index + indexOffset,
						rootMoveNumber,
					);
				}
				case 'b':
				default: {
					// This tends to be verbose when White's move has no comments or commands.
					// TODO: Work on making the output a little more terse.
					const num_san_nags_black = `${(index + indexOffset - 1) / 2 + rootMoveNumber}... ${move_san_and_nags_to_pgn_string(move.san, move.nags)}`;
					return append_variations(
						append_commands(append_text_comments(num_san_nags_black, move), move),
						move,
						index + indexOffset,
						rootMoveNumber,
					);
				}
			}
		})
		.join(' ');
}

/**
 * Converts the proprietary chess-study data to a PGN string in canonical format.
 */
export function jgn_to_pgn_string(study: JgnStudy): string {
	// console.lg(JSON.stringify(study, null, 2));
	const root = new Chess(study.rootFEN);
	const result = study.headers ? study.headers['Result'] : '*';

	// Seven Tag Roster should appear first and in the correct order.
	const seven_tags_string = seven_tag_keys
		.map((key, index) => {
			if (study.headers) {
				return `[${key} "${study.headers[key]}"]`;
			} else {
				return `[${key} "${seven_tag_defaults[index]}"]`;
			}
		})
		.join('\n');

	const other_tags_string = study.headers
		? Object.entries(study.headers)
				.filter((header) => {
					return !seven_tag_keys.includes(header[0]);
				})
				.map((header) => {
					// TODO: Some string escaping may be needed here for double quotes?
					return `[${header[0]} "${header[1]}"]`;
				})
				.join('\n')
		: '';

	const tags_string =
		other_tags_string.length > 0
			? `${seven_tags_string}\n${other_tags_string}`
			: seven_tags_string;

	let gameComment: string | null = null;
	if (study.comment) {
		gameComment = generateText(study.comment, [StarterKit]);
	}

	const indexOffset = root.turn() === 'w' ? 0 : 1;
	// console.lg('indexOffset', indexOffset);
	const rootMoveNumber = root.moveNumber();
	// console.lg('rootMoveNumber', rootMoveNumber);
	const moves_string = moves_to_string(study.moves, indexOffset, rootMoveNumber);
	return `${tags_string}\n\n${gameComment ? `{${gameComment}}\n` : ''}${moves_string} ${result}`;
}
