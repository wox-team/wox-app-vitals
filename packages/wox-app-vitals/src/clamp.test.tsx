import { expect, test } from 'vitest';
import { clamp } from './clamp';

test('Clamp, when value exceeds max, should clamped the value', () => {
	expect(clamp(0, 10, 9)).toBe(9);
});

test('Clamp, when value does not exceeds max, should return the original value', () => {
	expect(clamp(0, 5, 9)).toBe(5);
});

test('Clamp, when value falls short of min, should bring up the value to min', () => {
	expect(clamp(9, 0, 10)).toBe(9);
});

test('Clamp, when min is more than max, should throw an error', () => {
	expect(() => clamp(9, 0, 0)).toThrow();
});
