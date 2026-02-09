/**
 * Creates a new array whose elements are arrays of maximum length chunkSize each containing the original elements in order.
 * If the offsetByOne parameter is true then all elements are shifted to the next chunk (and empty chunks are removed).
 * @param items
 * @param chunkSize
 * @param offsetByOne
 * @returns
 * [],        2, false => []
 * [a],       2, false => [ [a] ]
 * [a, b],    2, false => [ [a, b]]
 * [a, b, c], 2, false => [ [a, b], [c]]
 * [],        2, true  => []
 * [a],       2, true  => [ [a] ]
 * [a, b],    2, true  => [ [a], [b]]
 * [a, b, c], 2, true  => [ [a], [b, c]]
 */
export function chunkArray<T>(
	items: T[],
	chunkSize: number,
	offsetByOne = false,
): T[][] {
	return items.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor((index + (offsetByOne ? 1 : 0)) / chunkSize);

		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = [];
		}

		resultArray[chunkIndex].push(item);

		return resultArray;
	}, [] as T[][]);
}

export function chunkArrayRedux<T>(
	items: T[],
	chunkSize: number,
	offsetByOne = false,
): (T | null)[][] {
	return items.reduce(
		(resultArray, item, index) => {
			const chunkIndex = Math.floor((index + (offsetByOne ? 1 : 0)) / chunkSize);

			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = [];
				for (let i = 0; i < chunkSize; i++) {
					resultArray[chunkIndex].push(null);
				}
			}

			resultArray[chunkIndex].shift();
			resultArray[chunkIndex].push(item);

			return resultArray;
		},
		[] as (T | null)[][],
	);
}

function simpleArraysEqual<T>(a: T[], b: T[]) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; ++i) {
		// Check if elements are arrays and recurse
		if (Array.isArray(a[i]) && Array.isArray(b[i])) {
			throw new Error();
		} else if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}

function chunkArraysEqual<T>(a: T[][], b: T[][]) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; ++i) {
		// Check if elements are arrays and recurse
		if (Array.isArray(a[i]) && Array.isArray(b[i])) {
			if (!simpleArraysEqual(a[i], b[i])) return false;
		} else if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}
function assertChunkArraysEqual<T>(actual: T[][], expect: T[][]) {
	console.assert(
		chunkArraysEqual(actual, expect),
		'actual is',
		JSON.stringify(actual),
		'expect is',
		JSON.stringify(expect),
	);
}
{
	const actual = chunkArray([], 2);
	const expect = [] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a'], 2);
	const expect = [['a']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b'], 2);
	const expect = [['a', 'b']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c'], 2);
	const expect = [['a', 'b'], ['c']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd'], 2);
	const expect = [
		['a', 'b'],
		['c', 'd'],
	] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e'], 2);
	const expect = [['a', 'b'], ['c', 'd'], ['e']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 2);
	const expect = [
		['a', 'b'],
		['c', 'd'],
		['e', 'f'],
	] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray([], 2, true);
	const expect = [] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a'], 2, true);
	const expect = [['a']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b'], 2, true);
	const expect = [['a'], ['b']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c'], 2, true);
	const expect = [['a'], ['b', 'c']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d', 'e']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d', 'e'], ['f']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray([], 2);
	const expect = [] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a'], 2);
	const expect = [['a']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b'], 2);
	const expect = [['a', 'b']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c'], 2);
	const expect = [['a', 'b'], ['c']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd'], 2);
	const expect = [
		['a', 'b'],
		['c', 'd'],
	] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e'], 2);
	const expect = [['a', 'b'], ['c', 'd'], ['e']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 2);
	const expect = [
		['a', 'b'],
		['c', 'd'],
		['e', 'f'],
	] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArrayRedux([], 2, true);
	const expect = [] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArrayRedux(['a'], 2, true);
	const expect = [[null, 'a']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArrayRedux(['a', 'b'], 2, true);
	const expect = [['a'], ['b']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c'], 2, true);
	const expect = [['a'], ['b', 'c']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d', 'e']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
{
	const actual = chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 2, true);
	const expect = [['a'], ['b', 'c'], ['d', 'e'], ['f']] as string[][];
	assertChunkArraysEqual(actual, expect);
}
