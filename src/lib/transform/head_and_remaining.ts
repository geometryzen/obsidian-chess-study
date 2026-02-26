export function head_and_remaining<T>(elements: ReadonlyArray<T>): {
	x: T;
	remaining: T[];
} {
	if (elements.length > 0) {
		const remaining = [...elements];
		const x = remaining.shift() as T;
		return { x, remaining };
	} else {
		throw new Error('elements must have at least one element');
	}
}
