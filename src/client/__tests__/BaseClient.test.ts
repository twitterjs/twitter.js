import { test, expect } from 'vitest';
import { EventEmitter } from 'node:events';
import { BaseClient } from '../BaseClient';

test('BaseClient extends EventEmitter', () => {
	expect(BaseClient.prototype instanceof EventEmitter).toBe(true);
});
