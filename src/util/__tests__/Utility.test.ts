import { test, expect } from 'vitest';
import { objectHasKey, mergeDefault } from '../Utility';

test('key is present', () => {
	expect(objectHasKey({ one: 1 }, 'one')).toBe(true);
});

test('key is not present', () => {
	expect(objectHasKey({ one: 1 }, 'two')).toBe(false);
});

test('merge objects with mutually exclusive keys', () => {
	expect(mergeDefault({ one: 1 }, { two: 2 })).toStrictEqual({ one: 1, two: 2 });
});

test('merge objects with one common key', () => {
	expect(mergeDefault({ one: 1, two: 2 }, { two: 2 })).toStrictEqual({ one: 1, two: 2 });
});

test('merge objects with one common key but different values', () => {
	expect(mergeDefault({ a: 'alpha', b: 'beta' }, { b: 'boy' })).toStrictEqual({ a: 'alpha', b: 'boy' });
});

test('merge objects with one common key but its value in given object is undefined', () => {
	expect(mergeDefault({ one: 1, two: 2 }, { two: undefined })).toStrictEqual({ one: 1, two: 2 });
});

test('merge objects with one common key but its value in given object is null', () => {
	expect(mergeDefault({ one: 1, two: 2 }, { two: null })).toStrictEqual({ one: 1, two: null });
});
