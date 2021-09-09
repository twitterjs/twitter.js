import { Client } from '../Client';
import { EventEmitter } from 'events';
import { BaseClient } from '../BaseClient';

test('BaseClient extends EventEmitter', () => {
  expect(BaseClient.prototype instanceof EventEmitter).toBe(true);
});

test('Client extends BaseClient', () => {
  expect(Client.prototype instanceof BaseClient).toBe(true);
});
