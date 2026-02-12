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

export const NAG_drawish_position = 10;
export const NAG_equal_chances_quiet_position = 11;
export const NAG_equal_chances_active_position = 12;
export const NAG_unclear_position = 13;
export const NAG_white_has_a_slight_advantage = 14;
export const NAG_black_has_a_slight_advantage = 15;
export const NAG_white_has_a_moderate_advantage = 16;
export const NAG_black_has_a_moderate_advantage = 17;
export const NAG_white_has_a_decisive_advantage = 18;
export const NAG_black_has_a_decisive_advantage = 19;
export const NAG_white_has_a_crushing_advantage = 20;
export const NAG_black_has_a_crushing_advantage = 21;

const move_quality_nags: NumericAnnotationGlyph[] = [
	NAG_very_good_move,
	NAG_good_move,
	NAG_speculative_move,
	NAG_questionable_move,
	NAG_poor_move,
	NAG_very_poor_move,
];
/*
const position_evaluation_nags: NumericAnnotationGlyph[] = [
	NAG_very_good_move,
	NAG_good_move,
	NAG_speculative_move,
	NAG_questionable_move,
	NAG_poor_move,
	NAG_very_poor_move,
];
*/

export type NumericAnnotationGlyph =
	| typeof NAG_null
	| typeof NAG_good_move
	| typeof NAG_poor_move
	| typeof NAG_very_good_move
	| typeof NAG_very_poor_move
	| typeof NAG_speculative_move
	| typeof NAG_questionable_move
	| typeof NAG_drawish_position
	| typeof NAG_equal_chances_quiet_position
	| typeof NAG_equal_chances_active_position
	| typeof NAG_unclear_position
	| typeof NAG_white_has_a_slight_advantage
	| typeof NAG_black_has_a_slight_advantage
	| typeof NAG_white_has_a_moderate_advantage
	| typeof NAG_black_has_a_moderate_advantage
	| typeof NAG_white_has_a_decisive_advantage
	| typeof NAG_black_has_a_decisive_advantage
	| typeof NAG_white_has_a_crushing_advantage
	| typeof NAG_black_has_a_crushing_advantage;

export function nags_to_dollars(nags: NumericAnnotationGlyph[]): string {
	if (Array.isArray(nags)) {
		return nags
			.map((nag) => {
				return `$${nag}`;
			})
			.join(' ');
	} else {
		return '';
	}
}

export function nag_to_human(nag: NumericAnnotationGlyph): string {
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
		case NAG_drawish_position:
			return '=';
		case NAG_white_has_a_slight_advantage:
			return '⩲';
		case NAG_white_has_a_moderate_advantage:
			return '±';
		case NAG_white_has_a_decisive_advantage:
			return '+−';
		case NAG_white_has_a_crushing_advantage:
			return 'White';
		case NAG_black_has_a_slight_advantage:
			return '⩱';
		case NAG_black_has_a_moderate_advantage:
			return '∓';
		case NAG_black_has_a_decisive_advantage:
			return '−+';
		case NAG_black_has_a_crushing_advantage:
			return 'Black';
		case NAG_unclear_position:
			return '∞';
		default: {
			return `${nag}`;
		}
	}
}

export function nags_to_human(nags: NumericAnnotationGlyph[]): string {
	console.log('nags_to_human', JSON.stringify(nags));
	if (Array.isArray(nags)) {
		return nags.map(nag_to_human).join(' ');
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
		rs.sort((a, b) => a - b);
		return rs;
	}
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

export function increase_position_evaluation(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	if (contains_nag(nags, NAG_white_has_a_crushing_advantage)) {
		// Do nothing
		return nags;
	} else if (contains_nag(nags, NAG_white_has_a_decisive_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_decisive_advantage),
			NAG_white_has_a_crushing_advantage,
		);
	} else if (contains_nag(nags, NAG_white_has_a_moderate_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_moderate_advantage),
			NAG_white_has_a_decisive_advantage,
		);
	} else if (contains_nag(nags, NAG_white_has_a_slight_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_slight_advantage),
			NAG_white_has_a_moderate_advantage,
		);
	} else if (contains_nag(nags, NAG_drawish_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_drawish_position),
			NAG_white_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_equal_chances_quiet_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_equal_chances_quiet_position),
			NAG_white_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_equal_chances_active_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_equal_chances_active_position),
			NAG_white_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_black_has_a_slight_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_slight_advantage),
			NAG_drawish_position,
		);
	} else if (contains_nag(nags, NAG_black_has_a_moderate_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_moderate_advantage),
			NAG_black_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_black_has_a_decisive_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_decisive_advantage),
			NAG_black_has_a_moderate_advantage,
		);
	} else if (contains_nag(nags, NAG_black_has_a_crushing_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_crushing_advantage),
			NAG_black_has_a_decisive_advantage,
		);
	} else {
		return ensure_nag(nags, NAG_white_has_a_slight_advantage);
	}
}

export function decrease_position_evaluation(
	nags: NumericAnnotationGlyph[],
): NumericAnnotationGlyph[] {
	if (contains_nag(nags, NAG_black_has_a_crushing_advantage)) {
		// Do nothing
		return nags;
	} else if (contains_nag(nags, NAG_black_has_a_decisive_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_decisive_advantage),
			NAG_black_has_a_crushing_advantage,
		);
	} else if (contains_nag(nags, NAG_black_has_a_moderate_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_moderate_advantage),
			NAG_black_has_a_decisive_advantage,
		);
	} else if (contains_nag(nags, NAG_black_has_a_slight_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_black_has_a_slight_advantage),
			NAG_black_has_a_moderate_advantage,
		);
	} else if (contains_nag(nags, NAG_drawish_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_drawish_position),
			NAG_black_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_equal_chances_quiet_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_equal_chances_quiet_position),
			NAG_black_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_equal_chances_active_position)) {
		return ensure_nag(
			remove_nag(nags, NAG_equal_chances_active_position),
			NAG_black_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_white_has_a_slight_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_slight_advantage),
			NAG_drawish_position,
		);
	} else if (contains_nag(nags, NAG_white_has_a_moderate_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_moderate_advantage),
			NAG_white_has_a_slight_advantage,
		);
	} else if (contains_nag(nags, NAG_white_has_a_decisive_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_decisive_advantage),
			NAG_white_has_a_moderate_advantage,
		);
	} else if (contains_nag(nags, NAG_white_has_a_crushing_advantage)) {
		return ensure_nag(
			remove_nag(nags, NAG_white_has_a_crushing_advantage),
			NAG_white_has_a_decisive_advantage,
		);
	} else {
		return ensure_nag(nags, NAG_black_has_a_slight_advantage);
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
