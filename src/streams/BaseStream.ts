import type { Client } from '../client';

/**
 * The base class for all streams
 */
export class BaseStream {
  /**
   * The instance of {@link Client} that was used to log in
   */
  client: Client;

  /**
   * @param client The logged in {@link Client} instance
   */
  constructor(client: Client) {
    Object.defineProperty(this, 'client', { writable: true, enumerable: false });
    this.client = client;
  }
}
