import { Client } from '../../client';
import { test, expect } from 'vitest';
import { BaseManager } from '../BaseManager';
import { BaseStructure } from '../../structures';
import type { Snowflake } from 'twitter-types';

const id: Snowflake = '1234567890';
const rawData = { id };
const client = new Client();
const baseManager = new BaseManager(client, BaseStructure);
const baseStructure = baseManager._add(id, rawData);

// BaseManager#_add
test('Add base structure to cache', () => {
	expect(baseManager._add(id, rawData)).toBeInstanceOf(BaseStructure);
});

// BaseManager#resolveId
test('Resolve id from a base structure', () => {
	expect(baseManager.resolveId(baseStructure)).toBe(id);
});

test('Resolve id from an id', () => {
	expect(baseManager.resolveId(id)).toBe(id);
});

// BaseManager#resolve
test('Resolve base structure from a base structure', () => {
	expect(baseManager.resolve(baseStructure)).toStrictEqual(baseStructure);
});

test('Resolve base structure from an id', () => {
	expect(baseManager.resolve(id)).toStrictEqual(baseStructure);
});
