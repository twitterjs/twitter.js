import { Client } from '../Client';
import { test, expect } from 'vitest';
import { BaseClient } from '../BaseClient';

test('Client extends BaseClient', () => {
	expect(Client.prototype instanceof BaseClient).toBe(true);
});
