export function is_shallow_arrays_equal<T>(a: T[], b: T[]) {
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
