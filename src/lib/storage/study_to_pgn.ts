import { generateText } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Chess } from 'chess.js';
import { ChessStudyFileContent } from '.';

/**
 * The keys of the Seven Tags Roster in the export ordering.
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

const seven_tag_defaults = ['?', '?', '????.??.??', '?', '?', '?', '*'];

/**
 * Converts the proprietary chess-study data to a PGN string in export format.
 */
export function chess_study_to_pgn_string(
	study: ChessStudyFileContent,
): string {
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
					return !seven_tag_keys.contains(header[0]);
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

	const indexOffset = root.turn() === 'w' ? 0 : 1;
	const rootMoveNumber = root.moveNumber();
	const moves_string = study.moves
		.map((move, index) => {
			switch (move.color) {
				case 'w': {
					const move_string = `${(index + indexOffset) / 2 + rootMoveNumber}. ${move.san}`;
					if (move.comment) {
						try {
							const text = generateText(move.comment, [StarterKit]);
							return `${move_string} { ${text} }`;
						} catch (e) {
							console.warn(e);
							console.warn(JSON.stringify(move.comment, null, 2));
							return move_string;
						}
					} else {
						return move_string;
					}
				}
				default: {
					// TODO: If there are no comments then we can omit the preamble before the san.
					const move_string = `${(index + indexOffset - 1) / 2 + rootMoveNumber}... ${move.san}`;
					if (move.comment) {
						try {
							const text = generateText(move.comment, [StarterKit]);
							return `${move_string} { ${text} }`;
						} catch (e) {
							console.warn(e);
							console.warn(JSON.stringify(move.comment, null, 2));
							return move_string;
						}
					} else {
						if (index === 0) {
							return move_string;
						} else {
							return move.san;
						}
					}
				}
			}
		})
		.join(' ');

	return `${tags_string}\n\n${moves_string} ${result}`;
}
