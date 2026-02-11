import { is_shallow_arrays_equal } from './lang/is_shallow_arrays_equal';

export const NAG_null = 0;
export const NAG_good_move = 1;
/**
 * Mistake
 */
export const NAG_poor_move = 2;
export const NAG_very_good_move = 3;
/**
 * Blunder
 */
export const NAG_very_poor_move = 4;
export const NAG_speculative_move = 5;
/**
 * Inaccuracy
 */
export const NAG_questionable_move = 6;

const move_quality_nags: NumericAnnotationGlyph[] = [
	NAG_very_good_move,
	NAG_good_move,
	NAG_speculative_move,
	NAG_questionable_move,
	NAG_poor_move,
	NAG_very_poor_move,
];

export type NumericAnnotationGlyph =
	| typeof NAG_null
	| typeof NAG_good_move
	| typeof NAG_poor_move
	| typeof NAG_very_good_move
	| typeof NAG_very_poor_move
	| typeof NAG_speculative_move
	| typeof NAG_questionable_move;

export function nag_to_string(nag: NumericAnnotationGlyph): string {
	switch (nag) {
		case NAG_null:
			return '';
		case NAG_good_move:
			return '!';
		case NAG_poor_move:
			return '?';
		case NAG_very_good_move:
			return '!!';
		case NAG_very_poor_move:
			return '??';
		case NAG_speculative_move:
			return '!?';
		case NAG_questionable_move:
			return '?!';
		default: {
			return `${nag}`;
		}
	}
}

export function nags_to_string(nags: NumericAnnotationGlyph[]): string {
	if (Array.isArray(nags)) {
		return nags.map(nag_to_string).join(' ');
	} else {
		return '';
	}
}

export function remove_nag(
	nags: NumericAnnotationGlyph[],
	target: NumericAnnotationGlyph,
): NumericAnnotationGlyph[] {
	if (contains_nag(nags, target)) {
		return nags.filter((nag) => {
			return nag !== target;
		});
	} else {
		return nags;
	}
}

export function remove_nags(
	nags: NumericAnnotationGlyph[],
	excludes: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	return nags.filter((nag) => {
		return !contains_nag(excludes, nag);
	});
}

export function ensure_nag(
	nags: NumericAnnotationGlyph[],
	target: NumericAnnotationGlyph,
): NumericAnnotationGlyph[] {
	if (contains_nag(nags, target)) {
		return nags;
	} else {
		const rs = nags.map((nag) => nag);
		rs.push(target);
		rs.sort();
		return rs;
	}
	return nags;
}

export function contains_nag(
	nags: NumericAnnotationGlyph[],
	target: NumericAnnotationGlyph,
): boolean {
	if (Array.isArray(nags)) {
		return nags.contains(target);
	} else {
		return false;
	}
}

export function annotate_move_correct(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	return remove_nags(nags, move_quality_nags);
}

export function annotate_move_inaccurate(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	const clean = remove_nags(
		nags,
		remove_nag(move_quality_nags, NAG_questionable_move),
	);
	return ensure_nag(clean, NAG_questionable_move);
}

export function annotate_move_mistake(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	const clean = remove_nags(nags, remove_nag(move_quality_nags, NAG_poor_move));
	return ensure_nag(clean, NAG_poor_move);
}

export function annotate_move_blunder(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	const clean = remove_nags(
		nags,
		remove_nag(move_quality_nags, NAG_very_poor_move),
	);
	return ensure_nag(clean, NAG_very_poor_move);
}

function assert_shallow_arrays_equal<T>(actual: T[], expect: T[]) {
	console.assert(
		is_shallow_arrays_equal(actual, expect),
		'actual is',
		JSON.stringify(actual),
		'expect is',
		JSON.stringify(expect),
	);
}
{
	const actual = [NAG_null];
	const expect = [NAG_null];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const nags: NumericAnnotationGlyph[] = [NAG_null];
	const target: NumericAnnotationGlyph = NAG_null;
	console.assert(
		contains_nag(nags, target),
		'nags is',
		JSON.stringify(nags),
		'target is',
		JSON.stringify(target),
	);
}
{
	const nags: NumericAnnotationGlyph[] = [];
	const needle: NumericAnnotationGlyph = NAG_null;
	console.assert(
		false === contains_nag(nags, needle),
		'nags is',
		JSON.stringify(nags),
		'target is',
		JSON.stringify(needle),
	);
}
{
	const actual = remove_nag([NAG_null, NAG_good_move], NAG_null);
	const expect = [NAG_good_move];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = remove_nag([NAG_null, NAG_good_move], NAG_good_move);
	const expect = [NAG_null];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = remove_nag([NAG_null, NAG_good_move], NAG_questionable_move);
	const expect = [NAG_null, NAG_good_move];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = ensure_nag([], NAG_null);
	const expect = [NAG_null];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = ensure_nag([NAG_null], NAG_null);
	const expect = [NAG_null];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = ensure_nag([NAG_null], NAG_good_move);
	const expect = [NAG_null, NAG_good_move];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = ensure_nag([NAG_good_move], NAG_null);
	const expect = [NAG_null, NAG_good_move];
	assert_shallow_arrays_equal(actual, expect);
}
{
	const actual = annotate_move_mistake([]);
	const expect = [NAG_poor_move];
	assert_shallow_arrays_equal(actual, expect);
}
