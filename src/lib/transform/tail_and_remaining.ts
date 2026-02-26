export function tail_and_remaining<T>(xs: ReadonlyArray<T>): {
	x: T;
	remaining: T[];
} {
	if (xs.length > 0) {
		const remaining = [...xs];
		const x = remaining.pop() as T;
		return { x, remaining };
	} else {
		throw new Error('xs array must have at least one element');
	}
}
