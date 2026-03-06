import { describe, expect, test } from '@jest/globals';
import { compile_pgn_or_fen } from '../lib/parsing/compile_pgn_or_fen';
import { JgnStudy } from '../lib/jgn/JgnStudy';
import { jgn_from_neo } from '../lib/transform/jgn_from_neo';
import { neo_from_jgn } from '../lib/transform/neo_from_jgn';

describe('round_trip', () => {
	test('1. e4', () => {
		const jgnExpect: JgnStudy = compile_pgn_or_fen('1. e4');
		const model = neo_from_jgn(jgnExpect);
		const jgnActual = jgn_from_neo(model);
		expect(jgnActual).toStrictEqual(jgnExpect);
	});
	test('1. e4 (1. d4) *', () => {
		const jgnExpect: JgnStudy = compile_pgn_or_fen('1. e4 (1. d4) *');
		const modelExpect = neo_from_jgn(jgnExpect);
		const jgnActual = jgn_from_neo(modelExpect);
		const modelActual = neo_from_jgn(jgnActual);
		expect(jgnActual).toStrictEqual(jgnExpect);
		expect(modelActual).toStrictEqual(modelExpect);
	});
});
