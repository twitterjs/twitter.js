import type { Client } from '../client';

/**
 * The base class for all streams
 */
export class BaseStream {
  /**
   * The client that initialized this class
   */
  client: Client;

  constructor(client: Client) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;
  }
}
