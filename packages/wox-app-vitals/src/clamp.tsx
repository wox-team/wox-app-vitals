export function clamp(min: number, value: number, max: number): number {
	if (min > max) throw new Error('min can not be greater than max');

	return Math.min(max, Math.max(min, value));
}
