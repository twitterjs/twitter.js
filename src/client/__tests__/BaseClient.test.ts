import { test, expect } from 'vitest';
import { EventEmitter } from 'events';
import { BaseClient } from '../BaseClient';

test('BaseClient extends EventEmitter', () => {
  expect(BaseClient.prototype instanceof EventEmitter).toBe(true);
});
