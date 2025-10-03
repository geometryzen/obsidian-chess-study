export function isFEN(str: string): boolean {
	// FEN typically has 6 parts separated by spaces
	const parts = str.split(' ');
	if (parts.length !== 6) {
		return false;
	}

	// Part 1: Piece placement (e.g., rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR)
	// Contains ranks separated by '/' and pieces/empty squares
	if (
		!/^[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+$/.test(
			parts[0],
		)
	) {
		return false;
	}

	// Part 2: Active color (w or b)
	if (!/^[wb]$/.test(parts[1])) {
		return false;
	}

	// Part 3: Castling availability (e.g., KQkq, Kq, -)
	if (!/^(K?Q?k?q?|-)$/.test(parts[2])) {
		return false;
	}

	// Part 4: En passant target square (e.g., e3, -, h6)
	if (!/^([a-h][1-8]|-)$/.test(parts[3])) {
		return false;
	}

	// Part 5: Halfmove clock (number)
	if (!/^\d+$/.test(parts[4])) {
		return false;
	}

	// Part 6: Fullmove number (number)
	if (!/^\d+$/.test(parts[5])) {
		return false;
	}

	return true;
}

export function isPGN(str: string): boolean {
	// PGN often starts with tag pairs like [Event "..."]
	if (str.trim().startsWith('[') && str.trim().includes(']')) {
		return true;
	}

	// PGN also contains move sequences with move numbers and SAN (Standard Algebraic Notation)
	// This is a more lenient check, as a valid PGN can be just moves.
	// Look for patterns like "1. e4 e5" or "1. e4 {comment} e5"
	if (/\d+\.\s+\S+/.test(str)) {
		// Matches "1. e4"
		return true;
	}

	return false;
}

export function getChessDataFormat(data: string): 'PGN' | 'FEN' | undefined {
	if (isPGN(data)) {
		return 'PGN';
	} else if (isFEN(data)) {
		return 'FEN';
	} else {
		return void 0;
	}
}
