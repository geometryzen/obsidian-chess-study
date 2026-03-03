import { Chess } from 'chess.js';

export function turn_color_white_or_black(chess: Chess): 'white' | 'black' {
	return chess.turn() === 'w' ? 'white' : 'black';
}
