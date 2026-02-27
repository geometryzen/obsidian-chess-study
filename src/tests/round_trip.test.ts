import { describe, expect, test } from '@jest/globals';
import { compile_pgn_or_fen } from '../lib/chess-logic';
import { JgnContent } from '../lib/jgn/JgnContent';
import { jgn_from_model } from '../lib/transform/jgn_from_model';
import { model_from_jgn } from '../lib/transform/model_from_jgn';

describe('round_trip', () => {
	test('1. e4', () => {
		const jgnExpect: JgnContent = compile_pgn_or_fen('1. e4');
		const model = model_from_jgn(jgnExpect);
		const jgnActual = jgn_from_model(model);
		expect(jgnActual).toStrictEqual(jgnExpect);
	});
	test('1. e4 (1. d4) *', () => {
		const jgnExpect: JgnContent = compile_pgn_or_fen('1. e4 (1. d4) *');
		const modelExpect = model_from_jgn(jgnExpect);
		const jgnActual = jgn_from_model(modelExpect);
		const modelActual = model_from_jgn(jgnActual);
		expect(jgnActual).toStrictEqual(jgnExpect);
		expect(modelActual).toStrictEqual(modelExpect);
	});
});
