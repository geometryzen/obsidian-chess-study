import { Chess } from 'chess.js';

export function turnColor(chess: Chess): 'white' | 'black' {
	return chess.turn() === 'w' ? 'white' : 'black';
}
